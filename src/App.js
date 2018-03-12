import React, { Component } from 'react';
import './App.css';
import TemplatePreview from './TemplatePreview';
import PatternPreview from './PatternPreview';
import Cfg from './Cfg';
import Utils from './Utils';
import {Radio, RadioGroup} from './RadioInputs';
import Prng from './Prng';


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
        <div>
          <label>degree</label>
          <RadioGroup name="degree" selectedValue={'' + this.state.degree}
            onChange={(nextValue) => {
             this.setState({degree: parseInt(nextValue, 10)});
            }}>
            <Radio value="3" />3
            <Radio value="6" />6
          </RadioGroup>
        </div>
        <div>
          <label>seed</label>
          <input type="number" value={this.state.seed}
            onChange={(e) => {
              this.setState({seed: parseInt(e.target.value, 10)});
            }} />
        </div>
        <div>
          <label>numLines</label>
          <input type="number" value={this.state.numLines}
            onChange={(e) => {
              this.setState({numLines: parseInt(e.target.value, 10)});
            }} />
        </div>
        <hr/>
        <TemplatePreview template={template}/>
        <PatternPreview template={template}/>
      </div>
    );
  }

  generateTemplate() {
    let angle = 360 / this.state.degree;
    let angleRads = angle * (Math.PI / 180);
    let width = 100;
    let height = (width / 2) / Math.tan(angleRads / 2);
    let trianglePoints = [
      [0, 0],
      [width / 2, height],
      [width, 0],
    ];
    let polyId = Utils.generateRandomId({prefix: 'poly-'});
    let clipId = Utils.generateRandomId({prefix: 'clip-'});
    let mesh = this.generateMesh({trianglePoints})
    let lineSvgs = [];
    for (let i = 0; i < this.state.numLines; i++) {
      let line = this.generateRandomLine({n: 2, mesh})
      lineSvgs.push(line.svg);
    }
    let svg = (`
      <svg ${Cfg.svgXmlns} width="${width}" height="${height}">
        <defs>
          <polygon id="${polyId}" points="${this.pointsToPointsStr(trianglePoints)}" />
          <clipPath id="${clipId}"><use href="#${polyId}"/>
          </clipPath>
        </defs>
        <g clip-path="url(#${clipId})">
          <use href="#${polyId}" stroke="blue" stroke-width="2" fill="lime" />
          ${lineSvgs.join(' ')}
        </g>
      </svg>
    `);
    return {
      svg: `${svg}`,
      width,
      height,
      rotationPoint: [width / 2, height],
      degree: this.state.degree,
    };
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
    opts = Object.assign(
      {n: 2, stroke: 'purple', strokeWidth: 1},
      opts
    );
    let {n, mesh, stroke, strokeWidth} = opts;
    let points = this.chooseRandom({n, items: mesh.vs});
    let dStr = `M${points[0].join(' ')}`
    for (let i = 1; i < points.length; i++) {
      dStr += ` L${points[i][0]} ${points[i][1]}`;
    }
    let svg = (`
      <path
        d="${dStr}" 
        stroke-width="${strokeWidth}"
        stroke="${stroke}"/>
    `);
    return {points, svg};
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
}

export default App;
