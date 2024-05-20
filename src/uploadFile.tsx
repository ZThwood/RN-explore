import React from 'react';
import {
  Text,
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';

const UploadFile = () => {
  const onPress = async () => {
    console.log('start:');

    const res = await DocumentPicker.pick({
      type: [DocumentPicker.types.audio],
    });

    console.log('Selected file:', res);

    const Address = '192.168.31.41';
    const url = `http://${Address}:8081/audio/upload_system_audio`;

    var formData = new FormData();
    formData.append('file', {
      uri: res[0].uri, // 注意 res 是数组
      type: res[0].type,
      name: res[0].name,
    });

    onXMLHttpRequest(url, formData);
    // onFetch(url, formData);
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={{width: 100, height: 100, backgroundColor: 'lightblue'}}>
        <Text style={{}}>上传</Text>
      </View>
    </TouchableOpacity>
  );
};

export default UploadFile;

const onFetch = async (url, formData) => {
  console.log('开始 onFetch');

  try {
    // 使用 fetch 上传文件
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const result = await response.json();
    console.log('onFetch File uploaded successfully:', result);
  } catch (error) {
    console.log('onFetch 错误', error);
  }
};

const onXMLHttpRequest = (url, formData) => {
  console.log('开始 XMLHttpRequest');

  try {
    // 创建 XMLHttpRequest 对象
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);

    // 设置请求头
    xhr.setRequestHeader('Content-Type', 'multipart/form-data');

    // 监听上传进度
    xhr.upload.onprogress = event => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        console.log(`Upload progress: ${percentComplete.toFixed(2)}%`);
      }
    };

    // 处理响应
    xhr.onload = () => {
      if (xhr.status === 200) {
        console.log('File uploaded successfully:', xhr.responseText);
        console.log('Success', 'File uploaded successfully');
      } else {
        console.error('File upload failed:', xhr.responseText);
        console.log('Error', 'File upload failed');
      }
    };

    // 处理错误
    xhr.onerror = () => {
      console.error('File upload error:', xhr.responseText);
      console.log('Error', 'File upload error');
    };

    // 发送请求
    xhr.send(formData);
  } catch (err) {
    console.log('XMLHttpRequest 错误', err);
  }
};
