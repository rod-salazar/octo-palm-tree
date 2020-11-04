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

import type {DimensionValue} from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

const HEIGHT = Dimensions.get('window').height;

const styles: {[string]: IStyle} = StyleSheet.create({
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
const INITIAL_ROWS = [
  {
    panes: [
      {type: 'pane', width: THIRD, style: styles.Panel, onMouseEnter: () => {}, onMouseLeave: () => {}},
      {type: 'pane', width: THIRD, style: styles.Panel, onMouseEnter: () => {}, onMouseLeave: () => {}},
      {type: 'pane', width: THIRD, style: styles.Panel, onMouseEnter: () => {}, onMouseLeave: () => {}},
    ],
    height: HEIGHT - (HEIGHT / 3),
  },
  {
    panes: [
      {type: 'pane', width: WIDTH, style: styles.Panel, onMouseEnter: () => {}, onMouseLeave: () => {}},
    ],
    height: HEIGHT / 3,
  },
];

function setResizeCursor() {
  NativeModules.Cursor.SetCursorTo("resize");
}

function setDefaultCursor() {
  NativeModules.Cursor.SetCursorTo("arrow");
}

const App: () => React$Node = () => {
  return (
    <View>
     <Panes initial_panes={INITIAL_ROWS[0].panes} vertical={false} />
    </View>
  );
};

type IStyle = {|
  height?: DimensionValue;
  width?: DimensionValue;
  backgroundColor?: string;
|}

type Pane = {|
  type: string;
  width: number;
  style: IStyle;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
|}

interface PanesProps {
  initial_panes: Array<Pane>;
  vertical: boolean;
}

const Panes: (PanesProps) => React$Node = (props: PanesProps) => {
  const [panes, setPanes] = useState(props.initial_panes);

  // The dx of the divider index (if there is 1 divider, the index is 0).
  // We keep an object of dx so that we can index by pane index (pane index)
  // to refer to the index of the divider that is in front of it, and substracting
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
          setDxDiffs({[dividerIndex]: gesture.dx});
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

  const items = [];
  for (let i = 0; i < panes.length; i+=1) {
    const leftDividerDx = dxDiffs[i] ? dxDiffs[i] : 0;
    const rightDividerDx = dxDiffs[i-1] ? dxDiffs[i-1] : 0;

    const isLast = i + 1 == panes.length;

    // Push panes as Views
    items.push(
      <View
        key={items.length}
        style={{...panes[i].style, width: panes[i].width + leftDividerDx - rightDividerDx - (isLast ? 0 : DIVIDER_WIDTH)}}>
      </View>
    );

    // Push divider if not at the end
    if (!isLast) {
      items.push(
        <View
          key={items.length}
          style={{...styles.Divider, width: DIVIDER_WIDTH}}
          onMouseEnter={setResizeCursor}
          onMouseLeave={setDefaultCursor}
          {...panResponders[i].panHandlers}>
        </View>
      );
    }
  }

  return (
    <View style={{flex: 1, flexDirection: 'row'}}>
      {items}
    </View>
  );
};

export default App;
