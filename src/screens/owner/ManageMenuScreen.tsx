import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import { MenuStatus, food } from "../../types/cart";
import FoodCard from "../../components/FoodCard";
import { getAllFoods } from "../../services/food.service";
import CustomButton from "../../components/CustomButton";
import LogoutButton from "../../components/LogoutButton";
import { getCategories } from "../../services/food.service";
import { Ionicons } from "@expo/vector-icons";

export default function ManagerMenuScreen() {
  const [foods, setFoods] = useState<food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [sortType, setSortType] = useState<
    "default" | "price_asc" | "price_desc"
  >("default");
  const [showSortModal, setShowSortModal] = useState(false);
  const filteredFood = useMemo(() => {
    let result = [...foods];
    // category
    if (selectedCategory !== 0) {
      result = result.filter((item) => item.category_id === selectedCategory);
    }
    // search
    if (searchText.trim()) {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase()),
      );
    }
    // sort
    switch (sortType) {
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;

      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "default":
        result.sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [foods, selectedCategory, searchText, sortType]);
  const isFlag = useRef(true);
  //set cờ để kiểm tra người dùng vẫn còn trong màn hình
  const fetchFoods = async () => {
    try {
      setError("");
      const data = await getAllFoods();
      const formattedFoods = data.map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        image_url: item.image_url,
        is_available: item.is_available,
        description: item.description,
        category_id: item.category_id,
        category_name: item.categories?.category_name ?? "Unknown",
      }));

      if (isFlag.current) {
        setFoods(formattedFoods);
      }
    } catch (error) {
      if (isFlag.current) {
        setError("Unable to load the menu");
      }
      throw error;
    }
  };
  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      if (isFlag.current) {
        setCategories([
          {
            id: 0,
            category_name: "All",
          },
          ...data,
        ]);
      }
    } catch (error) {
      if (isFlag.current) {
        setError("Unable to load the menu");
      }
      throw error;
    }
  };
  const loadData = async () => {
    try {
      if (foods.length === 0) {
        setLoading(true);
      }
      await Promise.all([fetchFoods(), fetchCategories()]);
    } catch (error) {
    } finally {
      if (isFlag.current) {
        setLoading(false);
      }
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      isFlag.current = true;
      loadData();
      return () => {
        isFlag.current = false;
      };
    }, []),
  );
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF7622" />
        <Text>Loading menu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <CustomButton
          title="Thử lại"
          onPress={() => fetchFoods()}
          buttonStyle={styles.retryButton}
          textStyle={styles.retryText}
        />
      </View>
    );
  }
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setSearchText("");
      setSelectedCategory(0);
      setSortType("default");
      const data = await getAllFoods();
      const formattedFoods = data.map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        image_url: item.image_url,
        is_available: item.is_available,
        description: item.description,
        category_id: item.category_id,
        category_name: item.categories?.category_name ?? "Unknown",
      }));
      if (isFlag.current) {
        setFoods(formattedFoods);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải lại", [
        {
          text: "Thử lại",
          onPress: () => handleRefresh(),
        },
      ]);
    } finally {
      if (isFlag.current) {
        setRefreshing(false);
      }
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Menu</Text>
        <LogoutButton />
      </View>
      {/* search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" />

        <TextInput
          placeholder="Search food..."
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />

        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>
      {/* tab */}
      <View style={styles.tabs}>
        {/* Category */}
        <TouchableOpacity
          style={styles.categoryButton}
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={styles.categoryText}>
            {categories.find((c) => c.id === selectedCategory)?.category_name}
          </Text>
          <Ionicons
            style={{ marginLeft: "auto" }}
            name="chevron-down"
            size={18}
            color="#333"
          />
        </TouchableOpacity>
        {/* Sort */}
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortModal(true)}
        >
          <Text style={styles.sortText}>
            {sortType === "price_asc"
              ? "Increase"
              : sortType === "price_desc"
                ? "Decrease"
                : "Default"}
          </Text>
        </TouchableOpacity>
        {/* modal category */}
        <Modal visible={showCategoryModal} transparent animationType="slide">
          <Pressable
            style={styles.overlay}
            onPress={() => setShowCategoryModal(false)}
          />
          <View style={styles.bottomSheet}>
            <View style={styles.dragBar} />
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={() => {
                    setSelectedCategory(item.id);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.categoryItemText,
                      selectedCategory === item.id && {
                        color: "#00B14F",
                        fontWeight: "700",
                      },
                    ]}
                  >
                    {item.category_name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Modal>
        {/* modal sort */}
        <Modal visible={showSortModal} transparent animationType="slide">
          <Pressable
            style={styles.overlay}
            onPress={() => setShowSortModal(false)}
          />
          <View style={styles.bottomSheet}>
            <View style={styles.dragBar} />
            <TouchableOpacity
              style={styles.categoryItem}
              onPress={() => {
                setSortType("default");
                setShowSortModal(false);
              }}
            >
              <Text style={styles.categoryItemText}>Default</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.categoryItem}
              onPress={() => {
                setSortType("price_asc");
                setShowSortModal(false);
              }}
            >
              <Text style={styles.categoryItemText}>Increase</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.categoryItem}
              onPress={() => {
                setSortType("price_desc");
                setShowSortModal(false);
              }}
            >
              <Text style={styles.categoryItemText}>Decrease</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
      {/* tính tổng số món ăn cho từng loại */}
      <View style={styles.subContainer}>
        <Text style={styles.countText}>{filteredFood.length} items</Text>
        {/* add */}
        <View style={styles.actionButtons}>
          {/* add */}
          <CustomButton
            iconName="add"
            iconType="ion"
            iconColor="white"
            onPress={() => navigation.navigate("AddEditFood" as never)}
            buttonStyle={styles.iconButton}
          />

          {/* refresh */}
          <CustomButton
            iconName="refresh"
            iconType="ion"
            iconColor="white"
            onPress={handleRefresh}
            isLoading={refreshing}
            disabled={refreshing}
            buttonStyle={styles.iconButton}
          />
        </View>
      </View>
      {/* list */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        {filteredFood.map((item) => (
          <FoodCard
            key={item.id}
            id={item.id}
            name={item.name}
            category_name={item.category_name}
            price={item.price}
            image_url={item.image_url}
            is_available={item.is_available}
            onPress={() =>
              navigation.navigate("AddEditFood", {
                food: item,
              })
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FF7622",
  },

  tabs: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
    marginBottom: 10,
  },

  countText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  retryButton: {
    backgroundColor: "#FF7622",
    marginTop: 16,
    width: "50%",
  },

  retryText: {
    color: "white",
    fontSize: 14,
  },

  errorText: {
    fontSize: 16,
    color: "#B1B1B1",
    textAlign: "center",
    marginBottom: 16,
  },

  subContainer: {
    marginHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    paddingVertical: 0,
  },
  header: {
    width: "100%",
    backgroundColor: "#181C2E",
    paddingTop: 65,
    paddingBottom: 28,
    paddingHorizontal: 24,
    marginBottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryButton: {
    marginLeft: 20,
    marginBottom: 15,
    width: 150,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 28,
    paddingHorizontal: 20,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "left",
    color: "#222",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  bottomSheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "70%",
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  dragBar: {
    width: 50,
    height: 5,
    backgroundColor: "#D9D9D9",
    borderRadius: 999,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  categoryItem: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
  },
  categoryItemText: {
    fontSize: 18,
    color: "#222",
  },
  selectedCategoryItem: {
    backgroundColor: "#F5FFF8",
  },
  selectedCategoryText: {
    color: "#00B14F",
    fontWeight: "700",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 12,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 52,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#222",
  },
  sortButton: {
    marginRight: 20,
    marginBottom: 15,
    width: 110,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 28,
    paddingHorizontal: 20,
  },
  sortText: {
    flex: 1,
    textAlign: "center",
    fontWeight: "500",
    color: "#222",
  },
});
