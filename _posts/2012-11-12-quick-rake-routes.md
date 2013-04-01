---
layout: post
title: "Quick rake routes"
tags : [rake, rails, shell]
---
{% include JB/setup %}

В больших проектах с кучей контроллеров, выполнение команды `rake routes` может занимать много времени. В большистве проектов routes.rb банальный, без хитрой логики, поэтому если файл routes.rb не изменялся с последнего запуска, можно закешировать результат выполнения команды rake routes. Для использования, создайте файл, например `/usr/local/bin/routes` (не забудьте дать права на исполнение) и добавьте в него код:

```
if [ -f config/routes.rb ]; then
  recent=`ls -t config/routes.rb .routeslist\~ 2>/dev/null | head -n 1`
  if [[ $recent != '.routeslist~' ]]; then
    rake routes > .routeslist~
  fi
  cat .routeslist~ | grep "$1"
else
  echo 'Routes file not found';
fi
```

Теперь при повторном запуске команды «routes», вы получите моментальный результат. Не забудьте добавить файл «.routeslist~», в который кешируется результат, в `.gitignore`.

Передав аргумент, например «routes POST», к результатам будет применён grep и они будут отфильтрованы.