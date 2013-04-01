---
layout: post
title: "Sublime Text 2: gem source"
tags : [rake, rails, shell]
---
{% include JB/setup %}

Часто бывает нужно заглянуть в исходники используемого гема. Большинство IDE (вроде RubyMine) позволяют это делать внутри себя, но они для меня медленны и монструозны и я использую свой любимый Sublime Text 2.

Для быстрого доступа к исходникам гема я написал bash-скрипт (немного дополнив этот):

```
#!/bin/sh
# view gem source in sublime text 2
if test "$1" == ""
then
  echo 'Specify gem name';
else
  p=$(bundle show $1);
  if [[ $p == /* ]]
  then
    subl $p;
  else
    echo $p;
  fi
fi
```

После некоторого времени использования я понял, что сильно не хватает автокомплита, который я и добавил:

```
#compdef gemsource
if [ -f Gemfile ]; then
  recent=`last_modified .gemlist~ Gemfile`
  if [[ $recent != '.gemlist~' ]]; then
    bundle show | cut -d " " -f 4 | sed 1d > .gemlist~
  fi
  compadd `cat .gemlist~`
fi
```

Для кеширования списка гемов создаётся файл .gemlist~, так что не забудьте добавить его в gitignore, если будете использовать.