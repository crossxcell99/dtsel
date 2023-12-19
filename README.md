A simplistic pure javascript datetime selector


## Usage Example

```js
instance = new dtsel.DTS({
    element: 'input[name="date_field"]',
    direction: 'BOTTOM',
    dateFormat: "yyyy-mm-dd",
    showTime: false,
    timeFormat: "HH:MM:SS"
});
```
![](https://i.imgur.com/DeYesl9.jpg)


## Typedefs

<dl>
<dt><a href="#Config">Config</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#DTSState">DTSState</a> : <code>Object</code></dt>
<dd><p>The local state</p>
</dd>
<dt><a href="#BodyType">BodyType</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="Config"></a>

## Config : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| dateFormat | <code>String</code> | 
| timeFormat | <code>String</code> | 
| showDate | <code>Boolean</code> | 
| showTime | <code>Boolean</code> | 
| paddingX | <code>Number</code> | 
| paddingY | <code>Number</code> | 
| defaultView | [<code>BodyType</code>](#BodyType) | 
| direction | <code>&quot;TOP&quot;</code> \| <code>&quot;BOTTOM&quot;</code> | 

<a name="DTSState"></a>

## DTSState : <code>Object</code>
The local state

**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| fullYear | <code>Number</code> | 
| month | <code>Number</code> | 
| date | <code>Number</code> | 
| hours | <code>Number</code> | 
| minutes | <code>Number</code> | 
| seconds | <code>Number</code> | 
| bodyType | [<code>BodyType</code>](#BodyType) | 

<a name="BodyType"></a>

## BodyType : <code>&quot;DAYS&quot;</code> \| <code>&quot;MONTHS&quot;</code> \| <code>&quot;YEARS&quot;</code>
**Kind**: global typedef  
