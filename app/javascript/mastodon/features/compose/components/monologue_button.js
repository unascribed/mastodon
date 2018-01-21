import React from 'react';
import IconButton from '../../../components/icon_button';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';

const messages = defineMessages({
  title: { id: 'compose_form.monologuing', defaultMessage: 'Monologue mode' }
});

const iconStyle = {
  lineHeight: '27px',
  height: null
};

class MonologueButton extends React.PureComponent {

  static propTypes = {
    active: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired
  };

  render () {
    const { active, onClick, intl } = this.props;

    return (
      <div>
        <IconButton icon='bullhorn' title={intl.formatMessage(messages.title)} onClick={onClick} style={iconStyle} size={18} active={active} inverted />
      </div>
    );
  }

}

export default injectIntl(MonologueButton);
