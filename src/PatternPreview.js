import React from 'react';
import Cfg from './Cfg';
import Utils from './Utils';


class Pattern extends React.Component {
  constructor(props) {
    super(props);
    this._symbolId = 'TILE_SYMBOL';
  }
  render() {
    let {template} = this.props;
    if (! template) {
      return null;
    }
    let style = Object.assign({}, this.props.style)
    if (this.props.template) {
      let tileSvg = this.generateTileSvg({template});
      let svgDataUri = `data:image/svg+xml;base64,${btoa(tileSvg)}`;
      style.backgroundImage = `url("${svgDataUri}")`;
    }

    return (<div style={style} />);
  }

  generateTileSvg (opts) {
    let degree = this.props.template.degree;
    let dispatchTargetName = `generateTileSvgForDegree${degree}`;
    let dispatchTargetFn = this[dispatchTargetName].bind(this);
    return dispatchTargetFn(opts);
  }

  _wrapInSymbol (opts) {
    let {svg, id} = opts;
    if (id == null) {
      id = this._generateRandomId({prefix: 'sym-'});
    }
    return {
      svg: `<symbol id="${id}">${svg}</symbol>`,
      id,
    };
  }

  _generateRandomId (opts) {
    return Utils.generateRandomId(opts);
  }

  generateTileSvgForDegree3 (opts) {
    let {template} = opts;
    let angle = 360 / template.degree;
    let sideAngle = (180 - angle) / 2;
    let sideAngleRads = sideAngle * (Math.PI / 180);
    let metaTemplate = {
      svg: this.generatePatternUnit({template}).svg,
      width: template.width,
      height: Math.tan(2 * sideAngleRads) * (template.width / 2),
      degree: 6,
    };
    metaTemplate.rotationPoint = [metaTemplate.width / 2, metaTemplate.height];
    return this.generateTileSvgForDegree6({template: metaTemplate});
  }

  generatePatternUnit(opts) {
    let {template} = opts;
    let {svg: templateSymbol, id: symbolId} = this._wrapInSymbol({
      svg: template.svg
    });
    let rotationPointStr = template.rotationPoint.join(' ');
    let rotatedTemplates = [];
    let rotationAngle = 360 / template.degree;
    for (let i = 0; i < template.degree; i++) {
      let rotatedTemplate = (
        `<use href="#${symbolId}"
              transform="rotate(${i * rotationAngle} ${rotationPointStr})"/>`
      );
      rotatedTemplates.push(rotatedTemplate);
    }
    let patternWidth, patternHeight = null;
    let transform = '';
    if (template.degree === 3) {
      let sideAngle = (180 - rotationAngle) / 2;
      patternWidth = template.width;
      patternHeight = Math.abs(
        Math.tan(2 * sideAngle * (Math.PI / 180)) * template.width / 2);
    } else if (template.degree === 6) {
      patternWidth = template.width * 2;
      patternHeight = 2 * template.height;
      transform = `transform="translate(${(template.width / 2)} 0)"`
    }
    let svg = (`
      <svg ${Cfg.svgXmlns} width="${patternWidth}" height="${patternHeight}">
        ${templateSymbol}
        <g ${transform}>
          ${rotatedTemplates.join(' ')}
        </g>
      </svg>
    `);
    return {
      svg,
      width: patternWidth,
      height: patternHeight,
    };
  }

  generateTileSvgForDegree6 (opts) {
    let {template} = opts;
    let patternUnit = this.generatePatternUnit({template});
    let unitSymbol = this._wrapInSymbol({svg: patternUnit.svg});
    let tileWidth = patternUnit.width * 1.5;
    let tileHeight = patternUnit.height;
    let clipId = this._generateRandomId({prefix: 'clip-'});
    let clipDef = (`
      <clipPath id="${clipId}">
        <rect x="0" y="0" width="${tileWidth}" height="${tileHeight}" />
      </clipPath>
    `);
    return (`
      <svg ${Cfg.svgXmlns} width="${tileWidth}" height="${tileHeight}">
        <defs>
          ${clipDef}
          ${unitSymbol.svg}
        </defs>
        <g clip-path="url(#${clipId})">
          <use href="#${unitSymbol.id}" x="0" y="0"/>
          <use href="#${unitSymbol.id}"
            x="${patternUnit.width * .75}"
            y="${patternUnit.height / 2}"/>
          <use href="#${unitSymbol.id}"
            x="${patternUnit.width * .75}"
            y="${-patternUnit.height / 2}"/>
          <use href="#${unitSymbol.id}"
            x="${-patternUnit.width * .75}"
            y="${patternUnit.height / 2}"/>
          <use href="#${unitSymbol.id}"
            x="${-patternUnit.width * .75}"
            y="${-patternUnit.height / 2}"/>
        </g>
      </svg>
    `);
  }

};

export default Pattern;
