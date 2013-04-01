---
layout: post
title: "Подводные камни JavaScript"
tags : [javascript]
---
{% include JB/setup %}

Мне очень нравится JavaScript и я считаю его мощным и удобным. Но для большинства начинающих JS-программистов, много проблем создаёт недопонимание аспектов языка. Часто конструкции языка ведут себя «нелогично». В данной статье я хочу привести примеры «граблей», на которые я наступил; объяснить поведение языка и дать пару советов.

### Типы

Как написано в [спецификации ECMAScript](http://ecma-international.org/ecma-262/5.1/#sec-8), всего существует 6 типов:

1. Undefined
2. Null
3. Boolean
4. String
5. Number
6. Object

Все значения должны принадлежать к ним. В JS есть оператор typeof, который, как казалось бы, должен возвращать тип объекта. Казалось бы, один из перечисленных. Что получается на самом деле:

```javascript
  typeof 5;             //"number",        ок, похоже на правду
  typeof "hello";       //"string" 
  typeof true;          //"boolean" 
  typeof undefined;     //"undefined"
  typeof {};            //"object".        Пока 5 из 5
  typeof null;          //"object".        WTF?
  typeof function(){};  //"function".      Разве у нас есть тип function?
```
**Проблема:** несмотря на то, что тип у null — Null, оператор возвращает 'object'; а тип у функции — Object, оператор возвращает 'function', а такого типа нет.
**Объяснение:** typeof возвращает не тип, а строку, которая зависит от аргумента и не является именем типа.
**Совет:**  забудьте про типы. Серьезно, я считаю что знание 6 типов JS не даст вам пользы, а оператор typeof используется довольно часто, поэтому лучше запомнить результаты его работы:
<table cellpadding="0" cellspacing="0" border="0" class="txt-table">
<tbody><tr>
<td style="text-align: left">Тип аргумента</td>
<td style="text-align: left">Результат</td>
</tr>
<tr>
<td style="text-align: left">Undefined</td>
<td style="text-align: left">undefined</td>
</tr>
<tr>
<td style="text-align: left">Null</td>
<td style="text-align: left">object</td>
</tr>
<tr>
<td style="text-align: left">Boolean</td>
<td style="text-align: left">boolean</td>
</tr>
<tr>
<td style="text-align: left">Number</td>
<td style="text-align: left">number</td>
</tr>
<tr>
<td style="text-align: left">String</td>
<td style="text-align: left">string</td>
</tr>
<tr>
<td style="text-align: left">Object (результаты оператора new, inline-объекты ({key: value}))</td>
<td style="text-align: left">object</td>
</tr>
<tr>
<td>Object (функции)</td>
<td style="text-align: left">function</td>
</tr>
</tbody></table>



### Магические значения: undefined, null, NaN
В  [спецификации](http://ecma-international.org/ecma-262/5.1/#sec-4.3.9) описаны так:

  * undefined value — primitive value used when a variable has not been assigned a value
  * Undefined type — type whose sole value is the undefined value
  * null value — primitive value that represents the intentional absence of any object value
  * Null type — type whose sole value is the null value
  * NaN — number value that is a IEEE 754 “Not-a-Number” value


У себя в голове я держу следующее:

* undefined — значение переменной, которая не была инициализирована. Единственное значение типа Undefined.
& null — умышленно созданный «пустой» объект. Единственное значение типа Null.
* NaN — специальное значение типа Number, для выражения «не чисел», «неопределенности». Может быть получено, например, как результат деления 0 на 0 (из курса матанализа помним, что это неопределенность, а деление других чисел на 0 — это бесконечность, для которой в JS есть значения Infinity).

С этими значениями я обнаружил много «магии». Для начала, булевы операции с ними:

```javascript
  !!undefined; //false
  !!NaN; //false
  !!null; //false
  //как видим, все 3 значения при приведении к boolean дают false

  null == undefined; //true

  undefined === undefined; //true
  null === null; //true

  NaN == undefined; //false
  NaN == null; //false

  NaN === NaN; //false!
  NaN == NaN; //false!
```
**Проблема:** с чем бы мы ни сравнивали NaN, результатом сравнения всегда будет false.
**Объяснение:** NaN может возникать в результате множества операций: 0/0, parseInt('неприводимая к числу строка'), Math.sqrt(-1) и было бы странно, если корень из -1 равнялся 0/0. Именно поэтому NaN !== NaN.
**Совет:** не использовать булевы операторы с NaN. Для проверки нужно использовать функцию isNaN.


```javascript
  typeof a; //'undefined'
  a; //ReferenceError: a is not defined
```
**Проблема:** оператор typeof говорит нам, что тип необъявленной переменной — undefined, но при обращении к ней происходит ошибка.
**Объяснение:** на самом деле, есть 2 понятия — Undefined и Undeclared. Так вот, необъявленная переменная является Undeclared-переменной и обращение к ней вызывает ошибку. Объявленная, но не инициализированная переменная принимает значение undefined и при обращении к ней ошибок не возникает.
**Совет:** перед обращением к переменной, вы должны быть уверенны, что она объявлена. Если вы обратитесь к Undeclared-переменной, то код, следующий за обращением, не будет выполнен.

```javascript
  var a; //вновь объявленная переменная, для которой не указано значение, принимает значение undefined
  console.log(undefined); //undefined
  console.log(a); // undefined
  a === undefined; //true
  undefined = 1;
  console.log(undefined); //1
  a === undefined; //false
```
**Проблема:** в любой момент мы можем прочитать и записать значение undefined, следовательно, кто-то может перезаписать его за нас и сравнение с undefined будет некорректным.
**Объяснение:** undefined — это не только значение undefined типа Undefined, но и глобальная переменная, а значит, любой может её переопределить.
**Совет:** просто сравнивать переменные с undefined — плохой тон. Есть 3 варианта решения данной проблемы, для создания «пуленепробиваемого» кода.

* Вы можете сравнивать не значение переменной, а её тип: «typeof a === 'undefined'»ю
* Использовать паттерн immediately-invoked function:

```javascript
  (function(window, undefined){
    //т.к. второй аргумент не был передан, значение переменной undefined будет «правильным».
  }(this));
```

* Для получения реального «undefined»-значения можно использовать оператор void (кстати, я не знаю другого применения этому оператору):

```javascript
  typeof void(0) === 'undefined' // true
```

Теперь попробуем совершить аналогичные действия с null:

```javascript
  console.log(null); //null
  null = 1; //ReferenceError: Invalid left-hand side in assignment
```
**Проблема:** несмотря на некоторые сходства между null и undefined, null мы перезаписать не можем. На самом деле проблема не в этом, а в том, что язык ведёт себя нелогично: даёт перезаписать undefined, но не даёт перезаписать null.</p>
**Объяснение:** null — это не глобальная переменная и вы не можете её создать, т. к. null — зарезервированное слово.
**Совет: ** в JavaScript не так много зарезервированных слов, проще их [запомнить](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Reserved_Words) и не использовать как имена переменных, чем вникать, в чём проблема, когда она возникнет.
<br /><br /><br />
И теперь сделаем тоже самое с NaN:

```javascript
  console.log(NaN); //NaN
  NaN = 1;
  console.log(NaN); //NaN
  isNaN(NaN); //true
```
**Проблема:** при переопределении undefined всё прошло успешно, при переопределении null возникла ошибка, а при переопределении NaN операция не вызвала ошибки, но свойство не было переопределено.
**Объяснение:** нужно понимать, что NaN — переменная глобального контекста (объекта window). Помимо этого, к NaN можно «достучаться» через Number.NaN. Но это неважно, ниодно из этих свойств вы не сможете переопределить, т. к. NaN — not writable property:

```javascript
  Object.getOwnPropertyDescriptor(window, NaN).writable; //false
  Object.getOwnPropertyDescriptor(Number, NaN).writable; //false
```
**Совет:** как JS-программисту, вам нужно знать об [атрибутах свойств](http://ecma-international.org/ecma-262/5.1/#sec-8.6.1):
<table cellpadding="0" cellspacing="0" border="0" class="txt-table">
<tbody><tr>
<td style="text-align: center">Атрибут</td>
<td style="text-align: center">Тип</td>
<td style="text-align: center">Смысл</td>
</tr>
<tr>
<td style="text-align: left">enumerable</td>
<td style="text-align: left">Boolean</td>
<td style="text-align: left">Если true, то данное свойство будет участвовать в циклах for-in</td>
</tr>
<tr>
<td style="text-align: left">writable</td>
<td style="text-align: left">Boolean</td>
<td style="text-align: left">Если false, то значение этого свойства нельзя будет изменить</td>
</tr>
<tr>
<td style="text-align: left">configurable</td>
<td style="text-align: left">Boolean</td>
<td style="text-align: left">Если false, то значение этого свойства нельзя изменить, удалить и изменить атрибуты свойства тоже нельзя</td>
</tr>
<tr>
<td style="text-align: left">value</td>
<td style="text-align: left">Любой</td>
<td style="text-align: left">Значение свойства при его чтении</td>
</tr>
<tr>
<td style="text-align: left">get</td>
<td style="text-align: left">Object (или Undefined)</td>
<td style="text-align: left">функция-геттер</td>
</tr>
<tr>
<td style="text-align: left">set</td>
<td style="text-align: left">Object (или Undefined)</td>
<td style="text-align: left">функция-сеттер</td>
</tr>
</tbody></table>
Вы можете объявлять неудаляемые или read-only свойства и для созданных вами объектов, используя метод Object.defineProperty:

```javascript
  var obj = {};
  Object.defineProperty(obj, 'a', {writable: true,  configurable: true,  value: 'a'});
  Object.defineProperty(obj, 'b', {writable: false, configurable: true,  value: 'b'});
  Object.defineProperty(obj, 'c', {writable: false, configurable: false, value: 'c'});

  console.log(obj.a); //a
  obj.a = 'b';
  console.log(obj.a); //b
  delete obj.a; //true

  console.log(obj.b); //b
  obj.b = 'a';
  console.log(obj.b); //b
  delete obj.b; //true

  console.log(obj.c); //c
  obj.b = 'a';
  console.log(obj.c); //c
  delete obj.b; //false
```


### Работа с дробными числами
Давайте вспомним 3-й класс и сложим несколько десятичных дробей. Результаты сложения в уме проверим в консоли JS:

```javascript
  0.5 + 0.5; //1
  0.5 + 0.7; //1.2
  0.1 + 0.2; //0.30000000000000004;
  0.1 + 0.7; //0.7999999999999999;
  0.1 + 0.2 - 0.2; //0.10000000000000003
```
**Проблема:** при сложении некоторых дробных чисел, выдаётся арифметически неверный результат.
**Объяснение:** такие результаты получаются из-за особенностей работы c числами с плавающей точкой. Это не является особенностью JavaScript, другие языки работают также (я проверил в PHP, Python и Ruby).
**Совет:** во-первых, вы, как программист, [обязаны знать](http://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html) об особенностях работы компьютера с числами с плавающей точкой. Во-вторых, в большинстве случаев достаточно просто округлять результаты. Но, если вдруг необходимо выдавать пользователю точный результат, например, при работе с данными о деньгах, вы можете просто умножать все аргументы на 10 и результат делить обратно на 10, например так:

```javascript
  function sum() {
    var result = 0;
    for (var i = 0, max = arguments.length; i< max; i++ ) {
      result += arguments[i]*10;
    }
    return result / 10;
  }
  sum(0.5, 0.5); //1
  sum(0.5, 0.7); //1.2
  sum(0.1, 0.2); //0.3
  sum(0.1, 0.7); //0.8
  sum(0.1, 0.2, -0.2); //0.1
```


### Вывод
Это только несколько необычных примеров с непредсказуемым результатом. Если помнить о них, то получится не наступить на те же грабли и быстро понять, в чём проблема. Если найдёте новый «нелогичный» кусок кода, то попробуйте осознать, что происходит с точки зрения языка, почитав [спецификацию](http://ecma-international.org/ecma-262/5.1/#sec-8) или [MDN](https://developer.mozilla.org/ru/).