import React, { useReducer, useState } from 'react';
import {
  Layout,
  Col,
  Row,
  Collapse,
  Avatar,
  List,
  Skeleton,
  Alert,
  Space,
} from 'antd';
import SearchForm from './components/SearchForm';
import Chart from './components/Chart';
import { addSpotifyStreamCount, addSoundChartsId } from './api/soundCharts';
import { searchSpotify } from './api/spotify';
import reducer, { actionSetSearchResults, actionSetMessages } from './reducer';
import './Newtab.css';
import './Newtab.scss';

const { Panel } = Collapse;
const { Header, Content } = Layout;
function getDateSegments({ startDate, endDate }) {
  if (!startDate && !endDate) {
    return [{ startDate, endDate }];
  }
  //  Passing in month will check month and year
  const isNinityDayPeriod = endDate
    .substract(90, 'days')
    .isSameOrAfter(startDate, 'month');
  console.log('IS 90 day period?', isNinityDayPeriod);
  if (isNinityDayPeriod) {
    return [
      {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
      },
    ];
  }
}

function normalizedDate(dates) {
  // set dates to the first day of the month if not the current month
  return dates;
}

const Newtab = () => {
  const [initLoading, setInitLoading] = useState();
  const [state, dispatch] = useReducer(reducer);
  const labels =
    ((state?.searchResults || [])[0] || {})?.streams?.map(({ date }) => date) ||
    [];
  const d =
    ((state?.searchResults || [])[0] || {})?.streams?.map(
      ({ value }) => value
    ) || [];
  const data = {
    labels: labels?.reverse(),
    datasets: [
      {
        label: 'Streams',
        data: d?.reverse(),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      /* {
       *   label: 'Dataset 2',
       *   data: labels.map(() => 4),
       *   borderColor: 'rgb(53, 162, 235)',
       *   backgroundColor: 'rgba(53, 162, 235, 0.5)',
       * }, */
    ],
  };
  return (
    <Layout className="App" style={{ height: '100vh' }}>
      <Content>
        <Row style={{ height: '100%' }} gutter={[2, 2]}>
          <Col span={8}>
            <section style={{ width: '300px', padding: '30px' }}>
              <SearchForm
                onSubmit={async (data) => {
                  const { artist, track, album, dates = [] } = data;
                  if (!artist && !track && !album) {
                    return;
                  }
                  setInitLoading(true);
                  dispatch(actionSetMessages({ reset: true }));
                  const [startDate, endDate] = normalizedDate(dates);
                  const spotifySearchResult = await searchSpotify({
                    track,
                    artist,
                    album,
                  });
                  console.log('Spotify serach results', spotifySearchResult);
                  const uuidResult = await addSoundChartsId(
                    spotifySearchResult
                  );
                  const songsWithUUID = uuidResult.filter((s) => !s.error);
                  const uuidErrors = uuidResult.filter((s) => s.error);
                  if (uuidErrors.length) {
                    dispatch(actionSetMessages({ messages: uuidErrors }));
                    console.log('UUID errors', uuidErrors);
                  }
                  const dateSegments = getDateSegments({ startDate, endDate });
                  const results = await dateSegments.reduce(
                    async (p, { startDate, endDate }) => {
                      const acc = await p;
                      const results = await addSpotifyStreamCount({
                        songs: songsWithUUID,
                        startDate,
                        endDate,
                      });
                      return [...acc, ...results];
                    },
                    []
                  );

                  const streamCountErrors = results.filter((r) => r.error);
                  const validResults = results.filter((r) => !r.error);
                  if (streamCountErrors.length) {
                    dispatch(actionSetMessages({ messages: uuidErrors }));
                    console.log(streamCountErrors);
                  }
                  dispatch(actionSetSearchResults(validResults));
                  setInitLoading(false);
                }}
              />
            </section>
          </Col>
          <Col span={16}>
            <section
              style={{
                maxHeight: '300px',
                overflowY: 'scroll',
                padding: '30px',
              }}
            >
              <List
                loading={initLoading}
                itemLayout="horizontal"
                loadMore={console.log}
                dataSource={state?.searchResults}
                renderItem={(result) => (
                  <List.Item
                    actions={[<a key="list-loadmore-edit">export csv</a>]}
                  >
                    <Skeleton avatar title={false} loading={false} active>
                      <List.Item.Meta
                        avatar={
                          <Avatar src={(result?.album?.thumbs[2] || {}).url} />
                        }
                        title={result?.name}
                        description={result?.album?.name}
                      />
                      <div>{result?.totalStreams?.toLocaleString()}</div>
                    </Skeleton>
                  </List.Item>
                )}
              />
            </section>
          </Col>
          <Col span={8}>
            <section
              style={{ height: '600px', overflowY: 'scroll', padding: '30px' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {state?.messages?.map((m, i) => (
                  <Alert
                    key={i}
                    message=""
                    description={m.message}
                    type="warning"
                    showIcon
                    closable
                  />
                ))}
              </Space>
            </section>
          </Col>

          <Col span={16}>
            <section style={{ padding: '30px' }}>
              <Chart data={data} />
            </section>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Newtab;
