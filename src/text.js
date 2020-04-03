const c = { yes: true, ok: 1 };
const a = el('container', { cool: c, well: 0 });
const b = el('container', { cool: c, well: 1, hello: true });
console.log(diff(a, b));

const d = 6;
/* var a = el('text',{
  text: '哈哈哈'
  x: 50,
  y: 50,
  anchor: {
  x: 0.5, y: 0.5
  }
})
var c = el('text',{
  x: 50,
  y: 50,
  anchor: {
  x: 0.5, y: 0.6
  }
})
var aa = a.render();
patch(aa, diff(a,c)); */
// 替代vue的render
/* const ab = el('text', {
  text: '哈哈哈',
  x: 50,
  y: 50,
  style: {
    fill: 'blue',
  },
  anchor: {
    x: 0, y: 0.5,
  },
}, [
  el('text', {
    text: '哈哈哈这里这里',
    x: 100,
    y: 50,
    anchor: {
      x: 0.5, y: 0.5,
    },
  })]);
const aa = ab.render();
app.stage.addChild(aa);
window.aa = aa; */
const data = {
  x: 0,
  _y: 20,
  get y() {
    const y = this._y;
    this._y += 50;
    return y;
  },
};

main.enemys = [
  {
    name: '史莱姆',
    atk: 10,
    def: 10,
  },
  {
    name: '绿色史莱姆',
    atk: 20,
    def: 30,
  },
];
