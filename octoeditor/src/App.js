/**
 * @format
 * @flow strict-local
 */

'use strict'

import React from 'react';
import {
  Dimensions,
  StyleSheet,
  NativeModules,
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
    backgroundColor: '#303030',
    height: HEIGHT,
  },
});

// For now 1 row, but we should extend to any nested mix with many rows.
// Sizes here dont matter, just some default pane.
const DIVIDER_WIDTH: number = 4;
const WIDTH = Dimensions.get('window').width;
const THIRD = WIDTH / 3;
const PANES = [
  {type: 'pane', width: THIRD, style: styles.Panel},
  {type: 'pane', width: WIDTH - THIRD, style: styles.Panel}
];

// The purpose of this is to figure out how to nice
// resize individual panes (and perhaps style them).
const DefaultPanes: () => React$Node = () => {
  const divider = {
    type: 'divider',
    style: styles.Divider,
    width: DIVIDER_WIDTH,
    onMouseEnter: () => {
      NativeModules.Cursor.SetCursorTo("resize");
    },
    onMouseLeave: () => {
      NativeModules.Cursor.SetCursorTo("arrow");
    }
  }; // make global const or something

  const items = []
  for (let i=0;i<PANES.length;i+=1) {
    items.push(PANES[i]);
    if (i + 1 != PANES.length) {
      items[items.length - 1].width -= DIVIDER_WIDTH;
      items.push(divider);
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
            onMouseLeave={item.onMouseLeave}>
          </View>
        );
      })}
    </View>
  );
};

export default App;
