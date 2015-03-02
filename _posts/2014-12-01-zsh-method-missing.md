---
layout: post
title: "method_missing в консоли"
tags : [zsh, shell]
language: ru
---
{% include JB/setup %}

Я постоянно забываю менять язык в консоли, особенно для каких-то мелких команд, вроде `ls`, `cd`, `rs` (алиас для `rails server`) и получается `ды`, `св`, `кы`, которые, само собой, не работают. 

Я решил, что хватит это терпеть и нашел решение проблемы. Для zsh [есть функция](http://zsh.sourceforge.net/Doc/Release/Command-Execution.html) `command_not_found_handler`. Это как `method_missing` из руби, только для zsh. Задаем эту функцию, например так:

    function command_not_found_handler() {
      ~/.dotfiles/bin/shell_method_missing $*
    }

и потом в файле `~/.dotfiles/bin/shell_method_missing` на любимом языке (в моём случае на ruby) пишем обработчик. [Я пока сделал только смену языка](https://github.com/KELiON/dotfiles/commit/06bc37b05efeaa6f6df87795c1dbf81928e8ad9c), но так можно сделать вообще, что угодно. Кто-то, например, [запускает cucumber](http://blog.pluralsight.com/shell-method-missing) по имени `.feature` файла. 

PS: эта же функция [работает в bash](http://www.linuxjournal.com/content/bash-command-not-found), а для [fish-fish](http://fishshell.com/) шелла есть [свой вариант](http://bjeanes.com/2009/10/using-fish-shells-event-system-to-behave-like-method-missing).