---
layout: post
title: "Как правильно посылать код подтверждения в SMS"
tags : [ux]
date: 2015-03-02 22:03:00
language: ru
---
{% include JB/setup %}

Вот так:
> 1234 — используйте этот код для подтверждения номера телефона

Зачем? Чтобы нужный мне код был первым, что я увижу в push-уведомлении:
![](https://s3.amazonaws.com/f.cl.ly/items/3c2U1r2A0J21342D2u1Y/Untitled.png)

В 99% случаев я буду ждать эту смс и из неё мне будет нужен именно код, потому что я знаю, что я делаю и зачем.

Кто делает не так? Например, альфа-банк для подтверждения операции шлет SMS:
> Dlya oplaty pokupki Podarok Mame na summu 100000.00 RUB vash odnorazoviy parol 123456

А Тинькофф делает немного лучше, но не идеально:
> SMS-kod: 1234 Operatsiya: Bileti v Thailand na summu 500.00 RUB Nikomu ne govorite etot kod! www.tinkoff.ru