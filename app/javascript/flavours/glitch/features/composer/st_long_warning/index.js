import React from 'react';
import Motion from 'flavours/glitch/util/optional_motion';
import spring from 'react-motion/lib/spring';
import { defineMessages, FormattedMessage } from 'react-intl';

//  This is the spring used with our motion.
const motionSpring = spring(1, { damping: 35, stiffness: 400 });

//  Messages.
const messages = defineMessages({
  disclaimer: {
    defaultMessage: 'This is a really long toot! Please mention this in the CW.',
    id: 'st.compose_form.long_disclaimer'
  },
});

//  The component.
export default function ComposerLongWarning () {
  return (
    <Motion
      defaultStyle={{
        opacity: 0,
        scaleX: 0.85,
        scaleY: 0.75,
      }}
      style={{
        opacity: motionSpring,
        scaleX: motionSpring,
        scaleY: motionSpring,
      }}
    >
      {({ opacity, scaleX, scaleY }) => (
        <div
          className='composer--warning'
          style={{
            opacity: opacity,
            transform: `scale(${scaleX}, ${scaleY})`,
          }}
        >
          <FormattedMessage
            {...messages.disclaimer}
          />
        </div>
      )}
    </Motion>
  );
}

ComposerLongWarning.propTypes = {};
