import fs from 'fs';
import * as htmlparser2 from 'htmlparser2';

// const dom = htmlparser2.parseDocument(`
// <!DOCTYPE html>
// <html lang=en>

// <body>
//     <h1>My First Heading</h1>
//     <p>My first paragraph.</p>
//   <label for="uno">Primer label</label>
//   <input id="uno" type="text" title="hola" />

//   <label for="dos">segundo label</label>
//   <input id="dos" type="text" title="prueba de title" max="3" min="3" maxlength="4" minlenght="4" />
// </body>

// </html>
// `);

if (process.argv.length < 3) {
  console.log('falta parámetros');
  process.exit();
}

const fichero = process.argv.slice(-1)[0];

const inputs = [];
const labels = [];
const buttons = [];
const selects = [];

const final = {
  inputs: [],
  buttons: [],
  selects: []
};

function compruebaTags(nodo) {
  if (nodo.tagName === 'input') {

    const nuevo = {
      id: nodo.attribs.id,
      title: nodo.attribs.title,
      min: nodo.attribs.min,
      max: nodo.attribs.max,
      maxLength: nodo.attribs.maxlength,
      minLength: nodo.attribs.minlenght
    }

    inputs.push(nuevo);
  }

  if (nodo.tagName === 'label') {
    const nuevo = {
      for: nodo.attribs.for,
      text: nodo.children[0]?.data ?? '',
      title: nodo.attribs.title
    }

    labels.push(nuevo);
  }

  if (nodo.tagName === 'button') {
    if (nodo.attribs.title) {
      const nuevo = {
        title: nodo.attribs.title,
        text: nodo.children[0]?.data ?? ''
      }

      buttons.push(nuevo);
    }
  }

  if (nodo.tagName === 'select') {
    const nuevo = {
      id: nodo.attribs.id,
      title: nodo.attribs.title
    }

    selects.push(nuevo);
  }

  if (nodo.childNodes) {
    nodo.childNodes.forEach(item => compruebaTags(item));
  }
}

function parseaDoc(data) {
  try {
    const dom = htmlparser2.parseDocument(data);
    iniciaCompruebaTags(dom);
  } catch (err) {
    console.error('Error parseando el fichero');
    console.log(err);
  }
}

function iniciaCompruebaTags(dom) {
  compruebaTags(dom);

  inputs.forEach(input => {
    const label = labels.find(item => item.for === input.id);
    const nuevo = {
      label,
      input
    };

    final.inputs.push(nuevo);
  });

  selects.forEach(selector => {
    const label = labels.find(item => item.for === selector.id);
    const nuevo = {
      label,
      selector
    };

    final.selects.push(nuevo);
  })

  final.buttons = buttons;

  guardarJSON();
}

function guardarJSON() {
  try {
    const data = JSON.stringify(final);
    fs.writeFileSync('datos.json', data);
  } catch (err) {
    console.error('Error guardando el fichero');
    console.log(err);
  }
}

try {
  const fileData = fs.readFileSync(fichero, 'utf8');
  parseaDoc(fileData);
} catch (err) {
  console.error('Error leyendo el fichero');
  console.log(err);
}
