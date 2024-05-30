import React, {useState} from 'react';
import {
  View,
  Button,
  FlatList,
  Image,
  Modal,
  TouchableOpacity,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';

const YourComponent = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const selectImage = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.images],
      });

      // 添加选择的图片到列表中
      setImages([...images, res[0].uri]);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // 用户取消了文件选择
        console.log('User cancelled image picker');
      } else {
        // 处理其他错误
        console.error('Error:', err);
      }
    }
  };

  const handleImagePress = image => {
    setSelectedImage(image);
    setModalVisible(true);
  };

  return (
    <View>
      <Button title="Select Image" onPress={selectImage} />
      <FlatList
        data={images}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
          <TouchableOpacity onPress={() => handleImagePress(item)}>
            <Image
              source={{uri: item}}
              style={{width: 100, height: 100, margin: 5}}
            />
          </TouchableOpacity>
        )}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(17, 16, 16, 0.9)',
            flex: 1,
          }}>
          <TouchableOpacity
            style={{width: 400, height: 400}}
            onPress={() => setModalVisible(false)}>
            {/* <Button title="close" onPress={() => setModalVisible(false)} /> */}
            <Image
              source={{uri: selectedImage}}
              style={{width: 400, height: 400, margin: 5}}
            />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default YourComponent;
