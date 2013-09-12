---
layout: post
title: "Sublime text: go to definition"
tags : [sublime, ctags, rails]
category: en
---
{% include JB/setup %}

Many developers don't use sublime text only because it hasn't "go to method definition". For those, sublime text has ctags plugin. You should install ctags by homebrew:

    brew install ctags

For make it working in sublime just install [plugin](https://github.com/SublimeText/CTags).

Теперь для индексации исходного кода нужно запустить команду `ctags`. Для rails-проектов нет смысла индексировать директории `.git` и `logs`. Запускаем индексацию и сохраняем результат в файл `.tags`:

    ctags -R --exclude=.git --exclude=log -f .tags

Помимо директории проекта, удобно иметь доступ к гемам. Для индексации используемых гемов запускаем ctags еще раз:

    ctags -R -f .gemtags `bundle show --paths`

Не забудьте добавить файлы ctags в `file_exclude_patterns`, чтобы они не мешали вам во время работы с проектом:

    "file_exclude_patterns": [...".tags", ".gemtags"]

Для переидексации тегов внутри саблайма можно использовать хоткей: `ctrl+t, ctrl+r`. Для правильной переидексации изменяем запускаемую команду в настройках плагина:

    "command"   :  "ctags -R --exclude=.git --exclude=log -f .tags && ctags -R -f .gemtags `bundle show --paths`"

Теперь переиндексация тегов будет работать правильно. Для "проваливания" в метод можно использовать пункт в контекстном меню или хоткей: `ctrl+t, ctrl+t`.

Отмечу, что индексация работает очень быстро: на большом проекте, с 60 гемами индексация занимает примерно 30 секунд.

Лично я долгое время обходился без ctags и сейчас пользуюсь ими не часто. Не забывайте, что в саблайме вы можете использовать go to symbol для перехода к методу внутри открытого файла (нажать ⌘+P и начать ввод, начиная с @). Так же, вы можете использовать @ не в начале строки, для перехода к методу в другом файле, например для перехода к методу index в home_controller.rb: homecont@in.

Кстати, ctags интегрируется и в другие редакторы, такие как vim.