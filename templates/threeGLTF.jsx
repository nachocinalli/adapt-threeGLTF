
import React from 'react';

import { templates, compile } from 'core/js/reactHelpers';

export default function ThreeGLTF (props) {
  const { _model } = props;
  return (
    <div className="component__inner threegltf__inner">

      <templates.header {...props} />

      <div className="component__widget threegltf__widget">
        <div className='threegltf__rendered' aria-label={compile(_model.ariaLabel)}></div>
        <div className='threegltf__description' dangerouslySetInnerHTML={{ __html: compile(_model.description) }}></div>
      </div>

    </div>
  );
}
