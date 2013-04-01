---
layout: post
title: "Zsh: история"
tags : [zsh, shell]
---
{% include JB/setup %}

По-умолчанию, в zsh клавиши вверх/вниз — это навигация по истории, независимо от введённого текста. Для поиска по истории введенного текста используется `ctrl+r`, что не совсем удобно. Для поиска по стрелкам, добавляем в .zshrc следующее:

```
bindkey    "^[[A" history-beginning-search-backward
bindkey    "^[[B" history-beginning-search-forward
```

Поиск по истории можно сделать чуть лучше, добавив флаги:

```
setopt INC_APPEND_HISTORY SHARE_HISTORY  #добавлять каждую команду в историю сразу после нажатия enter
setopt HIST_IGNORE_ALL_DUPS  #не отображать дубликаты
setopt HIST_REDUCE_BLANKS #не отображать пустые команды
```