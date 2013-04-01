---
layout: post
title: "Ruby on Rails + Nginx: кеширование"
tags : [ruby, rails, nginx, cache]
---
{% include JB/setup %}

Хочу поделиться опытом настройки кеширования на высоконагруженном проекте в связке ruby on rails + nginx.

### Описание проекта
Проект — страница выдачи сущностей с фильтром и endless-скроллом (или пагинацией, разницы не имеет), страница просмотра сущности и несколько статичных страниц. Важно, что отображение страницы однозначно зависит только от адреса, то есть нет случайных данных на странице  и  нет авторизации пользователей.

### Conditional GET
Conditional GET — это полезная возможность HTTP-протокола. Клиент в запросе уточняет условия, при которых он хочет получить новый ответ от сервера, иначе он берет закешированную версию. Если сервер поддерживает conditional get, вместе с ответом он выдает заголовкок Last Modified, в котором хранится время модификации страницы и (или) ETag, в котором хранится хеш ответа, в виде короткой строки (например, md5-хеш от всего содержимого страницы). Клиент, получив страницу, кеширует её у себя и при следующем запросе шлёт серверу заголовки If-Modified-Since и (или) If-None-Match, в которые, соответственно, подставляются Last Modified и ETag. Сервер, в свою очередь, сравнивает хеши и время модификации. Если хеши совпадают, а Last Modified &#8804; If-Modified-Since, то сервер возвращает ответ 304 Not Modified и пустое тело ответа:

```
Request Headers: 
If-Modified-Since:Fri, 12 Oct 2012 08:13:56 GMT
If-None-Match:"b86b53268ada9613191d3c8a59ce42b8"

Response Headers: 
HTTP/1.1 304 Not Modified
ETag:"b86b53268ada9613191d3c8a59ce42b8"
Last-Modified:Fri, 12 Oct 2012 08:13:56 GMT
```

В противном случае 200 OK и результат:

```
Request Headers: 
If-Modified-Since:Fri, 12 Oct 2012 07:33:50 GMT
If-None-Match:"89cd0d10d56469d67171b41c00ddf100"

Response Headers: 
HTTP/1.1 200 OK
ETag:"b86b53268ada9613191d3c8a59ce42b8"
Last-Modified:Fri, 12 Oct 2012 08:13:56 GMT
```

Conditional GET — отличный вариант для кеширования динамических страниц. При изменении страницы изменяется её хеш и клиент сразу получает новую версию. В нашем случае при добавлении новой сущности или при изменении существующей, должен измениться хеш страницы выдачи.

В Ruby on Rails есть [встроенная поддержка](http://guides.rubyonrails.org/caching_with_rails.html#conditional-get-support) conditional GET. Для работы с ним есть 2 метода: «fresh_when» и «stale?». Пример использования:

```ruby
  def action_fresh
    #если есть кеш — возвращаем 304, если нет — рендерим view
    fresh_when :last_modified => 1.year.ago, :etag => 'action_fresh'
  end

  def action_stale
    if stale?(:last_modified => 1.year_ago, :etag => 'action_stale') do
      #код, который будет выполняться в случае, если кеш устарел.
      #если кеш не устарел, код не выполняется и сервер возвращает 304 Not Modified
    end
  end
```

В нашем случае используем это следующим образом:

```ruby
  #будем обновлять данные после рестарта сервера
  def or_deploy_date date 
    restart_date = File.new(Rails.root.join('tmp', 'restart.txt')).mtime rescue 1.year.ago
    [restart_date, date].max
  end

  def list
    updated_at = collection.maximum(:updated_at)
    if stale?(last_modified: or_deploy_date(updated_at), etag: or_deploy_date(updated_at)) do
      #query, filter, order, paginate, etc.
    end
  end 

  def show
    updated_at = resource.updated_at
    if stale?(last_modified: or_deploy_date(updated_at), etag: or_deploy_date(updated_at)) do
      #query, etc.
    end
  end
```

### Кеширование статических страниц
Для статических страниц время обновление данных не критично и если пользователь получит новую страницу спустя 10 минут после её публикации, ничего страшного не произойдет. Добавим в контроллер следующий код:

```ruby
  before_filter :only => [:custom] do
    expires_in 10.minutes, :public => true
  end
```

Теперь со статическими страницами пользователь получает заголовок:

```
Cache-Control: max-age=600, public
```

Получив страницу один раз, на протяжении 10 минут он может загружать её из локального кеша браузера (почти моментально) и не отсылать запросы на сервер, который мы еще немного разгрузили от лишней нагрузки.

### Nginx proxy-cache
Если nginx один раз получает статическую страницу от rails-сервера и отдаёт клиенту, он может запомнить содержимое и не дергать сервер постоянно. Для этого в конфигурацию nginx необходимо добавить:

```
  proxy_cache_path /var/www/cache levels=1:1 keys_zone=zone:10m;
  proxy_cache zone;
  proxy_cache_bypass $http_pragma;
  proxy_cache_use_stale updating;
```

* /var/www/cache — директория для хранения кеша,
* 1:1 — уровни иерархии. То, как в каком виде будут создавать папки и файлы с кешем;
* keys_zone — имя зоны. Можно сделать несколько настроек кеширования, например, для различных поддоменов;
* 10m — время кеширования;
* proxy_cache_bypass — условие, при котором кеш не используется. Если строка пустая, используется кеш;
* $http_pragma — http-заголовок Pragma. Обычно браузеры подставляют Pragma: no-cache, если нужны обновленные данные (cmd+r в хроме);
* proxy_cache_use_stale — позволяет использовать устаревший закешированный ответ, если в данный момент он обновляется;

### Cookie-зависимые страницы
Спустя какое-то время, на проекте вводится валюта, в которой отображаются все цены. Валюта хранится в cookie в поле currency_code. Всё хорошо, но вот только теперь при изменении валюты клиент получает страницы из кеша с ценами в старой валюте. Для  conditional GET кеша решение очевидно: нужно добавить в хеш страницы cookie:

```ruby
  def or_deploy_date date
    restart_date = File.new(Rails.root.join('tmp', 'restart.txt')).mtime rescue 1.year.ago
    [restart_date, date].max
  end

  def etag_by_date date
    res = or_deploy_date(date).to_s
    res += cookies[:currency_code].to_s if cookies[:currency_code]
    res
  end
  
  def list
    updated_at = collection.maximum(:updated_at)
    if stale?(last_modified: or_deploy_date(updated_at), etag: etag_by_date(updated_at)) do
      #query, filter, order, paginate, etc.
    end
  end 

  def show
    updated_at = resource.updated_at
    if stale?(last_modified: or_deploy_date(updated_at), etag: etag_by_date(updated_at)) do
      #query, etc.
    end
  end
```

Теперь получается, что браузер клиента может закешировать страницу и после смены валюты без запроса на сервер выдать старую версию. Для предотвращения этого, удалим строку с expires_in — теперь браузеру запрещено кеширование.
Осталось изменить кеширование в nginx. После некоторого знакомства с proxy cache, становится очевидным, что нужно добавить наш cookie в proxy_cache_key:

```
  proxy_cache_key $scheme$proxy_host$uri$is_args$args$cookie_currency_code;
  #$scheme — протокол
  #$proxy_host, $uri — хост и урл
  #$is_args — "?" если есть query string, иначе пустая строка
  #$args — query string
  #$cookie_ — значение паметров из куки.
```

Пробуем и... nginx ничего не кеширует. Всё потому, что rails отдаёт заголовок «Cache-Control: max-age=0, private, must-revalidate», увидев его nginx понимает, что страницы кешировать не стоит. Так же nginx не кеширует страницы, отдающие заголовок SetCookie. Для игнорирования заголовка cache-control добавим:

```
  proxy_ignore_headers "Cache-Control";
```

Последний этап оказался для меня самым сложным, т. к. работа nginx, как мне кажется, не очень логична. Клиент делает запрос, nginx ищет в своём кеше страницу по $proxy_cache_key — если не находит её, запрашивает у rails сервера. Но потом он не просто отдаёт её, а сравнивает Last-Modified с If-None-Match, и если Last-Modified = If-None-Match, отдаёт клиенту 304 Not Modified, несмотря на то, что ETag &#8800; If-None-Match.  Немного потестировав, я пришел к выводу, что ответ 304 приходил только в случае точного совпадения Last Modified и If-None-Match. Почитав еще немного, выяснил, что во всём виноват параметр if_modified_since. Он может принимать 3 значения: off, exact и before, соответстветственно выключает сравнение, вклюет сравнение на точное совпадение и сравнение на Last-Modified &#8804; If-Modified-Since. Поставив off, всё заработало, как и планировалось. Так вот, nginx ведёт себя не логично, т. к. сравнивает только If-Modified-Since, без ETag. Причем похожего на if_modified_since параметра для ETag я не нашел в документации. Итоговая конфигурация nginx:

```
  proxy_cache_path /var/www/cache levels=1:1 keys_zone=zone:10m;
  proxy_cache zone;
  proxy_cache_bypass $http_pragma;
  proxy_cache_use_stale updating;
  proxy_cache_key $scheme$proxy_host$uri$is_args$args$cookie_currency_code;
  proxy_ignore_headers "Cache-Control";
  if_modified_since off;
```

### Debug кеширования
При отладке и настройке дебага, необходимо знать, что делает nginx: берет ли он страницы из кеша, какие заголовки получает от бэкэнда. Первый вариант для этого — создание лога, в который будут записываться данные о кешировании:

```
    log_format cache '***$time_local '
                     '$upstream_cache_status '
                     'Cache-Control: $upstream_http_cache_control '
                     'Expires: $upstream_http_expires '
                     '"$request" ($status) '
                     '"$http_user_agent" ';
    access_log  /var/log/nginx/cache.log cache;
```

Мне показалось, что этот вариант неудобен и проще добавить нужные данные в заголовки ответа, например:

```
  add_header Debug-Status $upstream_cache_status;
  add_header Debug-Expires $upstream_http_expires;
  add_header Debug-Cache-Control $upstream_http_cache_control;
```

Теперь в web-испекторе хрома можно посмотреть полученные от сервера заголовки. Возможные значения для Debug-Status:

* HIT — загружен из кеша,
* MISS — кеша нет,
* BYPASS — обход кеша, например при наличии заголовка Pragma,
* EXPIRED — кеш «просрочен»,
* UPDATING — кеш «просрочен», но nginx отдал старый кеш, т. к. включена опция proxy_cache_use_stale updating;

Для создания http-запросов через командную строку можно использовать curl, но удобнее использовать [HTTPie](https://github.com/jkbr/httpie), который позволяет в человеческом формате задать все заголовки и параметры, делает вывод с подсветкой и еще много всего полезного.

![](http://cl.ly/image/111B3l401K1d/Screen%20Shot%202012-10-17%20at%209.48.28%20AM.png)

PUT запрос с параметром hello = world и json-ответ


### Полезные ссылки
1. [Спецификация кеширования в протоколе http](http://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html);
2. [Еще про кеширование в http](http://www.mnot.net/cache_docs/);
3. [Про кеширование в Ruby on Rails ](http://guides.rubyonrails.org/caching_with_rails.html);
4. [Про proxy cache в nginx](http://nginx.org/ru/docs/http/ngx_http_proxy_module.html)
