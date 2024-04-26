// DataDisplayComponent.js
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const DataDisplayComponent = ({ data }) => {
  const chunkData = (array, size) => {
    return array.reduce((chunks, item, index) => {
      if (index % size === 0) {
        chunks.push([item]);
      } else {
        chunks[chunks.length - 1].push(item);
      }
      return chunks;
    }, []);
  };

  const pairedData = chunkData(data, 2);

  return (
    <FlatList
      data={pairedData}
      keyExtractor={(item, index) => `row_${index}`}
      renderItem={({ item: row }) => (
        <View style={styles.rowContainer}>
          {row.map((item) => (
            <View key={item.productId} style={styles.item}>
              <Text style={styles.itemTitle}>Product: {item.Product_Name}</Text>
              <View style={styles.itemDetails}>
                <Text style={styles.itemText}>Quantity: {item.Quantity}</Text>
                <Text style={styles.itemText}>Price: ${item.Price}</Text>
                <Text style={styles.itemText}>Total Price: ${item.Total_Price}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  item: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 12,
    backgroundColor: '#3498db',
    color: '#fff',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  itemDetails: {
    padding: 12,
  },
  itemText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
});

export default DataDisplayComponent;
