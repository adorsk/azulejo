import React, { Component } from 'react';
import './App.css';
import TemplatePreview from './TemplatePreview';
import PatternPreview from './PatternPreview';
import Cfg from './Cfg';
import Utils from './Utils';
import {Radio, RadioGroup} from './RadioInputs';
import Prng from './Prng';
import { Form } from 'semantic-ui-react';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      degree: 6,
      seed: Math.floor(Math.random() * 1e6),
      numLines: 2,
      template: null,
    }
  }

  render() {
    this._prng = new Prng({seed: this.state.seed});
    let template = this.generateTemplate();
    return (
      <div className="App">
        <div style={{width: '100vw', height: '100vh', display: 'flex', flexDirection: 'row'}}>
          <div 
            style={{
              height: '100%',
              width: '250px',
              padding: '10px',
              borderRight: 'thin solid gray',
              backgroundColor: 'black',
              color: 'gray',
              resize: 'horizontal',
            }}
            >
            {this.renderLeftCol({ template })}
          </div>
          <div style={{height: '100%', flex: '1 1 auto'}}>
            {this.renderRightCol({ template })}
          </div>
        </div>
      </div>
    );
  }

  renderLeftCol (opts) {
    let { template } = opts;
    return (
      <div id="left-column">
        <Form>
          <Form.Field>
            <label>degree</label>
            <RadioGroup name="degree" selectedValue={'' + this.state.degree}
              onChange={(nextValue) => {
                this.setState({degree: parseInt(nextValue, 10)});
              }}>
              <Radio value="3" />3
              <Radio value="6" />6
            </RadioGroup>
          </Form.Field>
          <Form.Field>
            <label>seed</label>
            <input type="number" value={this.state.seed}
              onChange={(e) => {
                this.setState({seed: parseInt(e.target.value, 10)});
              }} />
          </Form.Field>
          <Form.Field>
            <label># lines</label>
            <input type="number" value={this.state.numLines}
              onChange={(e) => {
                this.setState({numLines: parseInt(e.target.value, 10)});
              }} />
          </Form.Field>
        </Form>

        <div className="grid-bg"
          style={{marginTop: '2em', border: 'thin solid gray',
            borderRadius: '5px'}}
          >
          <TemplatePreview template={template}/>
        </div>
      </div>
    );
  }

  renderRightCol (opts) {
    let { template } = opts;
    let style = { width: '100%', height: '100%' };
    return (
      <PatternPreview template={template} style={style}/>
    );
  }

  generateTemplate() {
    let template = {elements: [], outlinePath: null};
    let angle = 360 / this.state.degree;
    let angleRads = angle * (Math.PI / 180);
    template.width = 100;
    template.height = (
      (template.width / 2) / Math.tan(angleRads / 2)
    );
    template.rotationPoint = [template.width / 2, template.height];
    template.degree = this.state.degree;
    let trianglePoints = [
      [0, 0],
      [template.width / 2, template.height],
      [template.width, 0],
    ];
    let trianglePath = {
      tag: 'path',
      attrs: {
        d: this.generateD({points: trianglePoints, closed: true})
      }
    };
    template.outlinePath = trianglePath;
    template.elements.push(this.cloneObj(trianglePath));
    let mesh = this.generateMesh({trianglePoints})
    for (let i = 0; i < this.state.numLines; i++) {
      let line = this.generateRandomLine({n: 2, mesh});
      template.elements.push(line);
    }
    for (let element of template.elements) {
      for (let colorAttr of ['fill', 'stroke']) {
        element.attrs[colorAttr] = this.generateRandomColor();
      }
      element.attrs['stroke-width'] = this.chooseRandom({
        n: 1,
        items: [0, 1, 2, 4, 8],
      })[0];
    }
    template.svg = this.generateSvgForTemplate({template});
    return template;
  }

  cloneObj (obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  generateD (opts) {
    let {points, closed} = Object.assign({closed: false}, opts);
    let d = `M${points[0].join(' ')}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L${points[i].join(' ')}`;
    }
    if (closed) {
      d += 'Z';
    }
    return d;
  }

  generateSvgForTemplate (opts) {
    let {template} = opts;
    let clipId = Utils.generateRandomId({prefix: 'clip-'});
    let elementSvgs = template.elements.map((element) => {
      return this.generateSvgForElement({element});
    }).join("\n");
    return (`
      <svg ${Cfg.svgXmlns}
        width="${template.width}" height="${template.height}">
        <defs>
          <clipPath id="${clipId}">
            ${this.generateSvgForElement({element: template.outlinePath})}
          </clipPath>
        </defs>
        <g clip-path="url(#${clipId})">
          ${elementSvgs}
        </g>
      </svg>
    `);
  }

  generateSvgForElement (opts) {
    let {element} = opts;
    let {tag, attrs} = element;
    return (`<${tag} ${this.attrsObjToStr({attrs})} />`);
  }

  attrsObjToStr (opts) {
    let {attrs} = opts;
    return Object.keys(attrs).map((attr) => {
      return `${attr}="${attrs[attr]}"`;
    }).join(' ');
  }

  pointsToPointsStr(points) {
    return points.map(p => p.join(',')).join(' ');
  }

  generateMesh(opts) {
    // There are several ways to make a mesh.
    // Here we make an xy grid of arbitrary resolution,
    // and add points where the grid intersects the edges of the triangle.
    let {trianglePoints, resolution} = opts;
    resolution |= 10;
    let vs = [];
    let xMin = 0
    let xMax = trianglePoints[2][0];
    let xRange = xMax - xMin;
    let xMid = xMin + (xRange / 2);
    let xInterval = xRange / resolution;
    let xs = [];
    for (let x = xMin; x < xMax; x += xInterval) {
      xs.push(x);
    }
    let yMin = 0;
    let yMax = trianglePoints[1][1];
    let yRange = yMax - yMin;
    let yInterval = yRange / resolution;
    let slope = (xRange / 2) * (1 / yRange);
    for (let y = 0; y < yMax - yInterval; y += yInterval) {
      let leftX = slope * y;
      let rightX = -slope * (y - 2 * yRange);
      vs.push([leftX, y]);
      for (let x of xs) {
        if ((x > leftX) && (x < rightX)) {
          vs.push([x, y]);
        }
      }
      vs.push([rightX, y]);
    }
    vs.push([xMid, yMax]); // triangle tip.
    return {vs};
  }

  generateRandomLine (opts) {
    let {n, mesh} = Object.assign({n: 2}, opts);
    let points = this.chooseRandom({n, items: mesh.vs});
    return {
      tag: 'path',
      attrs: {d: this.generateD({points})}
    };
  }

  chooseRandom (opts) {
    // this can be done better.
    opts = Object.assign({}, opts);
    let {n, items} = opts;
    if (n > items.length) {
      throw new Error(`n (${n}) > items.length (${items.length})`);
    }
    if (n === items.length ) {
      return items;
    }
    let choices = {};
    let numChoices = 0;
    while (numChoices < n) {
      let choiceIdx = this._prng.randomInt({min: 0, max: items.length - 1});
      if (choices[choiceIdx] === undefined) {
        choices[choiceIdx ] = items[choiceIdx];
        numChoices += 1;
      }
    }
    return Object.values(choices);
  }

  generateRandomColor (opts) {
    let h = this._prng.randomInt({min: 0, max: 359});
    let s = this._prng.randomInt({min: 0, max: 100});
    let l = this._prng.randomInt({min: 0, max: 100});
    let a = this._prng.random();
    return `hsla(${h}, ${s}%, ${l}%, ${a})`;
  }
}

export default App;
