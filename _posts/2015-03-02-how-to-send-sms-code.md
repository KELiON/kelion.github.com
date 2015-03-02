---
layout: post
title: "Как правильно посылать код подтверждения в SMS"
tags : [ux]
language: ru
---
{% include JB/setup %}

Альфа-банк для подтверждения операции шлет SMS:

> Dlya oplaty pokupki Podarok Dlya Mami na summu 100000.00 RUB vash odnorazoviy parol 123456

Банк Тинькофф делает немного лучше:

> SMS-kod: 1234 Operatsiya: Bileti v Thailand na summu 500.00 RUB Nikomu ne govorite etot kod! www.tinkoff.ru

Как нужно делать в идеале:
    
> 1234 — используйте этот код для подтверждения номера телефона

Зачем? Чтобы нужный мне код был первым, что я увижу в push-уведомлении:
![](https://s3.amazonaws.com/f.cl.ly/items/3c2U1r2A0J21342D2u1Y/Untitled.png)

