import React, { useState, useReducer } from 'react';
import {
  ExclamationCircleOutlined,
  AreaChartOutlined,
} from '@ant-design/icons';
import { Tabs, Layout, theme } from 'antd';
import SearchForm from './components/SearchForm';
import MessageList from './components/MessageList';
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
            <Tabs
              defaultActiveKey="1"
              items={[AreaChartOutlined, ExclamationCircleOutlined].map(
                (Icon, i) => {
                  const id = String(i + 1);
                  return {
                    label: (
                      <span>
                        <Icon
                          style={
                            i && state?.messages?.length ? { color: 'red' } : {}
                          }
                        />
                        {!i ? 'Results' : 'Warnings'}
                      </span>
                    ),
                    key: id,
                    children: !i ? (
                      <ResultsList
                        initLoading={initLoading}
                        searchResults={state?.searchResults}
                      />
                    ) : (
                      <MessageList messages={state?.messages} />
                    ),
                  };
                }
              )}
            />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
export default App;
