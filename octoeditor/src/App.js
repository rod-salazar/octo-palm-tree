/**
 * @format
 * @flow strict-local
 */

'use strict'

import React, { useRef, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  NativeModules,
  PanResponder,
  View,
  Text,
} from 'react-native';

const App: () => React$Node = () => {
  return (
    <View>
     <DefaultPanes />
    </View>
  );
};

const HEIGHT = Dimensions.get('window').height;

const styles = StyleSheet.create({
  Divider: {
    backgroundColor: '#000000',
    height: HEIGHT,
  },
  Panel: {
    backgroundColor: '#cccccc',
    height: HEIGHT,
  },
});


const DIVIDER_WIDTH: number = 3;
const WIDTH = Dimensions.get('window').width;

// Sizes here do not matter, it's just a starting state.
const THIRD = WIDTH / 3;
const INITIAL_PANES = [
  {type: 'pane', width: THIRD, style: styles.Panel, onMouseEnter: null, onMouseLeave: null},
  {type: 'pane', width: THIRD, style: styles.Panel, onMouseEnter: null, onMouseLeave: null},
  {type: 'pane', width: THIRD, style: styles.Panel, onMouseEnter: null, onMouseLeave: null},
];

const DefaultPanes: () => React$Node = () => {
  const [panes, setPanes] = useState(INITIAL_PANES);

  // The dx of the divider index (if there is 1 divider, the index is 0).
  // We keep an object of dx so that we can index by pane index (pane index)
  // refers to the index of the divider that is in front of it, and substracting
  // 1 from pane index gives you the divider index that is to the left of the pane.
  const [dxDiffs, setDxDiffs] = useState({});

  // Needed to reference dxDiffs from within the pan responder callbacks
  const dxRef = useRef<{[number]: number}>({});
  dxRef.current = dxDiffs;

  // Indexed by the pane index to the left.
  const panResponders = React.useMemo(() => {
    const ret = {};
    // Iterate over each divider index (there are panes-1 of them)
    for (var i = 0; i < panes.length - 1; i+=1) {
      // capture i here since we want to re-use in onPanResponderMove
      const dividerIndex = i;
      const responder = PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (event, gesture) => {
          setDxDiffs(dxRef => {
            // Set the dx value to the divider index.
            return {...dxRef, [dividerIndex]: gesture.dx};
          });
        },
        onPanResponderRelease: (evt, gestureState) => {
          // Save the pane size update
          const currDx = dxRef.current;
          setPanes(panes => {
            return panes.map((pane, paneIndex) => {
              const leftDividerDx = currDx[paneIndex] ? currDx[paneIndex] : 0;
              const rightDividerDx = currDx[paneIndex-1] ? currDx[paneIndex-1] : 0;
              if (leftDividerDx != 0 || rightDividerDx != 0) {
                return {
                  ...pane,
                  width: pane.width + leftDividerDx - rightDividerDx,
                };
              }

              return pane;
            });
          });
          setDxDiffs({});
        },
      });
      ret[i] = responder;
    }
    return ret;
  }, [panes]);

  const createDivider = (dividerIndex: number) => ({
    type: 'divider',
    style: styles.Divider,
    width: DIVIDER_WIDTH,
    onMouseEnter: () => {
      NativeModules.Cursor.SetCursorTo("resize");
    },
    onMouseLeave: () => {
      NativeModules.Cursor.SetCursorTo("arrow");
    },
    panHandlers: panResponders[dividerIndex].panHandlers,
  });

  const items = [];
  for (let i=0;i<panes.length;i+=1) {
    const leftDividerDx = dxDiffs[i] ? dxDiffs[i] : 0;
    const rightDividerDx = dxDiffs[i-1] ? dxDiffs[i-1] : 0;
    items.push({
      ...panes[i],
      width: panes[i].width + leftDividerDx - rightDividerDx,
    });
    if (i + 1 != panes.length) {
      items[items.length - 1].width -= DIVIDER_WIDTH;
      items.push(createDivider(i));
    }
  }

  return (
    <View style={{flex: 1, flexDirection: 'row',}}>
      {items.map((item, i) => {
        return (
          <View
            key={i}
            style={{...item.style, width: item.width}}
            onMouseEnter={item.onMouseEnter}
            onMouseLeave={item.onMouseLeave}
            {...(item.panHandlers ? item.panHandlers : {})}>
          </View>
        );
      })}
    </View>
  );
};

export default App;
