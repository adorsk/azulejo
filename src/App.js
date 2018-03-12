import React, { Component } from 'react';
import './App.css';
import TemplatePreview from './TemplatePreview';
import PatternPreview from './PatternPreview';
import Cfg from './Cfg';
import Utils from './Utils';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      degree: 3,
      template: null,
    }
  }

  render() {
    let template = this.generateTemplate();
    return (
      <div className="App">
        <div>
          <label>degree</label>
          <input type="number" value={this.state.degree}
           onChange={(e) => {
             this.setState({degree: e.target.value});
           }}
          />
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
    let svg = (`
      <svg ${Cfg.svgXmlns} width="${width}" height="${height}">
        <defs>
          <polygon id="${polyId}" points="${this.pointsToPointsStr(trianglePoints)}" />
          <clipPath id="${clipId}"><use href="#${polyId}"/>
          </clipPath>
        </defs>
        <use href="#${polyId}" stroke="blue" stroke-width="2" fill="lime"
          clip-path="url(#${clipId})"/>
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
}

export default App;
