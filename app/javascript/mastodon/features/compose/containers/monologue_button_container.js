import { connect } from 'react-redux';
import MonologueButton from '../components/monologue_button';
import { changeComposeMonologuing } from '../../../actions/compose';

const mapStateToProps = state => ({
  active: state.getIn(['compose', 'monologuing'])
});

const mapDispatchToProps = dispatch => ({

  onClick () {
    dispatch(changeComposeMonologuing());
  }

});

export default connect(mapStateToProps, mapDispatchToProps)(MonologueButton);
