import React from 'react';
import { Button, Form, Input, DatePicker } from 'antd';

const onFinishFailed = (errorInfo) => {
  console.log('Failed:', errorInfo);
};

const formStyle = {
  flex: '1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const SearchForm = ({ onSubmit = Function.prototype }) => (
  <Form
    style={{ display: 'flex', flexDirection: 'column', marginTop: '70px' }}
    name="basic"
    layout="vertical"
    labelCol={{ span: 16 }}
    wrapperCol={{ span: 16 }}
    initialValues={{ remember: true }}
    onFinish={onSubmit}
    onFinishFailed={onFinishFailed}
    autoComplete="off"
    type="flex"
    justify="center"
    align="middle"
  >
    <Form.Item
      type="flex"
      justify="center"
      align="middle"
      style={formStyle}
      label={<label style={{ color: 'white' }}>Artista</label>}
      name="artist"
    >
      <Input type="flex" justify="center" align="middle" />
    </Form.Item>
    <Form.Item
      type="flex"
      justify="center"
      align="middle"
      label={<label style={{ color: 'white' }}>Canción</label>}
      name="track"
    >
      <Input />
    </Form.Item>
    <Form.Item
      type="flex"
      justify="center"
      align="middle"
      label={<label style={{ color: 'white' }}>Album</label>}
      name="album"
    >
      <Input />
    </Form.Item>
    <Form.Item
      type="flex"
      justify="center"
      align="middle"
      label={<label style={{ color: 'white' }}>Desde</label>}
      name="startYear"
    >
      <DatePicker picker="year" />
    </Form.Item>
    <Form.Item
      type="flex"
      justify="center"
      align="middle"
      label={<label style={{ color: 'white' }}>Hasta</label>}
      name="endYear"
    >
      <DatePicker picker="year" />
    </Form.Item>
    <Form.Item type="flex" justify="center" align="middle">
      <Button style={{ marginTop: '20px' }} type="primary" htmlType="submit">
        Buscar
      </Button>
    </Form.Item>
  </Form>
);

export default SearchForm;
