import { MotiView } from "moti";
import React, { useState } from "react";
import { FlatList, LayoutChangeEvent, StyleSheet, View } from "react-native";
import { ReportCardItem } from "../types/reportes.types";
import { ReportCard } from "./ReportCard";

interface Props {
  reports: ReportCardItem[];
  onPrint: (id: string) => void;
}

export function ReportsGrid({ reports, onPrint }: Props) {
  const [containerWidth, setContainerWidth] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const getGridConfig = () => {
    if (containerWidth === 0) return { numColumns: 1, itemWidth: 0, gap: 0 };
    const gap = 12;
    const numColumns = containerWidth < 600 ? 1 : containerWidth < 900 ? 2 : 3;
    const totalGap = gap * (numColumns - 1);
    const itemWidth = (containerWidth - totalGap) / numColumns;
    return { numColumns, itemWidth, gap };
  };

  const { numColumns, itemWidth, gap } = getGridConfig();

  return (
    <View style={styles.container}>
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 350 }}
        style={{ flex: 1 }}
      >
        <View style={styles.listContainer} onLayout={onLayout}>
          {containerWidth > 0 && (
            <FlatList
              data={reports}
              key={numColumns}
              keyExtractor={(item) => item.id}
              numColumns={numColumns}
              columnWrapperStyle={
                numColumns > 1 ? { alignItems: "stretch" } : undefined
              }
              renderItem={({ item, index }) => (
                <View
                  style={{
                    width: itemWidth,
                    marginRight: index % numColumns < numColumns - 1 ? gap : 0,
                    marginBottom: gap,
                  }}
                >
                  <ReportCard
                    item={item}
                    index={index}
                    itemWidth={Number(itemWidth)}
                    onPrint={onPrint}
                  />
                </View>
              )}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContainer: {
    flex: 1,
  },
  list: {
    paddingBottom: 20,
  },
});
