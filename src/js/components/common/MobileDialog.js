import React, { PropTypes } from 'react';
import {Dialog} from 'material-ui';

const MobileDialog = props => (
  <Dialog
    {...props}

    repositionOnUpdate={false}
    autoDetectWindowHeight={false}
    autoScrollBodyContent={false}
    className="dialog-root"
    contentClassName="dialog-content"
    bodyClassName="dialog-body"
  >
    <div className="dialog-scroll" >
      {props.children}
    </div>
  </Dialog>
);

MobileDialog.propTypes = {
  children: PropTypes.node,
};

export default MobileDialog;