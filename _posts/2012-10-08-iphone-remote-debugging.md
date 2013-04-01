---
layout: post
title: "Iphone Remote Debugging"
tags : [tools]
---
{% include JB/setup %}


В ios6 появилось много новых фич: поддержка &lt;input type=&quot;file&quot;&gt;, requestAnimationFrame, remote debugging и еще [много чего](http://www.mobilexweb.com/blog/iphone-5-ios-6-html5-developers).
### Safari Remote Debugging
Недавно я попробовал  remote debugging — в пару тапов и кликов можно получить доступ в обычному вебкитовскому веб-инспектору и всей его мощи: к консоли, изменению html и css на лету, отладке JS. Для активации нужно включить web inspector на айфоне: `Settings -> Safari -> Advanced -> Web Inspector`.

![](http://cl.ly/image/2O2c1k0m2y0l/2012-10-08-09.57.14.png)
![](http://cl.ly/image/3p312H28023F/2012-10-08-09.57.18.png)
![](http://cl.ly/image/3N0O1E442m2D/2012-10-08-09.57.22.png)

После этого, открыв страницу в сафари (на айфоне), можно получить к ней доступ через сафари на компе (не забудьте включить Develop Menu в Preferences &rarr; Advanced):

![](http://cl.ly/image/401X1Y0w3u3e/safari-remote.png)

Работает всё очень быстро, есть доступ ко всем функциям веб-инспектора, но телефон нужно подключать к компьютеру кабелем, через WiFi всё сделать у меня так и не вышло. Плюс, есть возможность аналогичным способом отлаживать страницы, открытые в iOS эмуляторе из xCode (не забудьте его предварительно обновить).

### Adobe Edge Inpect
Помимо стандартного решения, есть софт от Адоби, до недавнего времени называвшийся Shadow, а теперь Edge Inspect. Для использования нужно скачать [приложение](http://itunes.apple.com/us/app/adobe-edge-inspect/id498621426?mt=8) для айфона или айпада в апп сторе, [расширение](https://chrome.google.com/webstore/detail/adobe-edge-inspect/ijoeapleklopieoejahbpdnhkjjgddem) для гугл хрома и [десктопное приложение](http://html.adobe.com/edge/inspect/).
Для подключения нужно

* Запустить десктопное приложение, которое будет работать в фоне;
* Открыть расширение и в нём посмотреть ip:

![](http://cl.ly/image/293K111E3n1k/Screen%20Shot%202012-10-08%20at%2010.59.02%20AM.png)

* Запустить приложение на айфоне и добавить подключение, ввести показанный ip:

![](http://cl.ly/image/0e04423f0d3t/f54f0c39-2a4c-4f9e-803e-75a04b3b3328.jpeg)

* В расширении ввести passcode:

![](http://cl.ly/image/1w3y2L261O21/8a66d49a-2516-453a-818b-db3f5fa7001c.jpeg)
![](http://cl.ly/image/29161E1y1F0H/Screen%20Shot%202012-10-08%20at%2010.47.47%20AM.png)

* Открыть страницу в Хроме (открытая вкладка продублируется на айфоне) и запустить Remote Inspection:

![](http://cl.ly/image/3N1w3P3V3i2V/Screen%20Shot%202012-10-08%20at%2011.25.13%20AM.png)

![](http://cl.ly/image/1y1y3X2x2s24/Screen%20Shot%202012-10-08%20at%2011.17.46%20AM.png)

После этого вам будет доступен веб-инспектор.

Из минусов: нужно ставить 3 программы, десктопное приложение периодически просто зависает, а сам процесс дебага очень томозной, вне зависимости от скорости вашего вай-фая, не все функции веб-инспектора доступны, например, я не нашел js-профайлера.

Из плюсов: такой вариант можно использовать с iOS начиная с 4й версии
