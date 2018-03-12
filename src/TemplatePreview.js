import React from 'react';


class TemplatePreview extends React.Component {
  render() {
    let {template} = this.props;
    if (! template) {
      return (<div>no template</div>);
    }
    let containerStyle = {
      maxWidth: 400,
      maxHeight: 200,
      border: 'thin solid gray',
      padding: 10,
      margin: 'auto',
    };
    return (
      <div>
        <div style={containerStyle}
          dangerouslySetInnerHTML={{__html: template.svg}} />
      </div>
    );
  }
}

export default TemplatePreview;
