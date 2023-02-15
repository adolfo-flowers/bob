import React from 'react';
import { Button, Form, Input, DatePicker } from 'antd';

const { RangePicker } = DatePicker;
const onFinishFailed = (errorInfo) => {
  console.log('Failed:', errorInfo);
};

const SearchForm = ({ onSubmit = Function.prototype }) => (
  <Form
    name="basic"
    labelCol={{ span: 8 }}
    wrapperCol={{ span: 16 }}
    style={{ maxWidth: 600 }}
    initialValues={{ remember: true }}
    onFinish={onSubmit}
    onFinishFailed={onFinishFailed}
    autoComplete="off"
  >
    <Form.Item label="Artist" name="artist">
      <Input />
    </Form.Item>
    <Form.Item label="Track" name="track">
      <Input />
    </Form.Item>
    <Form.Item label="Album" name="album">
      <Input />
    </Form.Item>
    <Form.Item label="Period" name="dates">
      <RangePicker picker="month" />
    </Form.Item>
    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
      <Button type="primary" htmlType="submit">
        Search
      </Button>
    </Form.Item>
  </Form>
);

export default SearchForm;
