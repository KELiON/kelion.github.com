---
layout: post
title: "Rails: Переопределение collection и member путей"
tags : [ruby, rails]
---
{% include JB/setup %}

Сразу пример: у вас есть контроллер "channels" и вы хотите использовать стандартные методы `channels_path` и `channel_path`, которым соответствуют действия `index` и `show`. По умолчанию, адреса для них будут `/channels` и `/channels/:id`, но вы хотите изменить стандартные адреса на `/channels/:flag`, (где `:flag`, например active или archive). Для `show` вы не хотите использовать `:id`, а а что-то вроде `/channels/:category/:slug`. Для переопределения пути к `index` достаточно сделать обычно описание через `get` с параметром `:as`, равному пустой строке и `:on => :colleciton`:

```ruby
resources :channels do
  get '(/:flag)', :defaults => {:flag => 'all'}, :as => '', :on => :collection
end
```

Немного сложнее переопределить путь к `show`, т.к. если просто написать

```ruby
resources :channels do
  get ':category/:slug', :as => '', :on => :member
end 
```

вы получите путь `:id/:category/:slug`. Для определения нового формата используйте `resource` вместо `resources` с параметром `:path`:

```ruby
resource :channel, :path => ':category/:slug'
```

Теперь у вас будут правильные методы `channels_path and `channel_path`.

Эту же проблему можно решить с помощью метода `mathch` в рутах, но в таком случае нужно будет использовать `match` для всех вложенных действий и контроллеров.