import { Layout, theme } from 'antd';
import React, { useState, useReducer } from 'react';
import SearchForm from './components/SearchForm';
import ResultsList from './components/ResultsList';
import reducer, { searchAction } from './reducer';

const { Content, Sider } = Layout;

const App = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const [initLoading, setInitLoading] = useState();
  const [state, dispatch] = useReducer(reducer);
  return (
    <Layout hasSider>
      <Sider
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <SearchForm
          onSubmit={(data) =>
            searchAction(setInitLoading, dispatch, state, data)
          }
        />
      </Sider>
      <Layout
        className="site-layout"
        style={{
          marginLeft: 200,
        }}
      >
        <Content
          style={{
            margin: '24px 16px 0',
            overflow: 'initial',
          }}
        >
          <div
            style={{
              padding: 24,
              textAlign: 'center',
              background: colorBgContainer,
            }}
          >
            <ResultsList
              initLoading={initLoading}
              searchResults={state?.searchResults}
            />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
export default App;
