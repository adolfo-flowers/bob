import React, { useReducer, useState } from 'react';
import { Col, Row, Collapse, Avatar, List, Skeleton } from 'antd';
import SearchForm from './components/SearchForm';
import Chart from './components/Chart';
import { addSpotifyStreamCount, addSoundChartsId } from './api/soundCharts';
import { searchSpotify } from './api/spotify';
import reducer, { actionSetSearchResults } from './reducer';
import './Newtab.css';
import './Newtab.scss';

const { Panel } = Collapse;

const Newtab = () => {
  const [initLoading, setInitLoading] = useState();
  const [state, dispatch] = useReducer(reducer);
  const labels =
    (state?.searchResults[0] || {})?.streams?.map(({ date }) => date) || [];
  const d =
    (state?.searchResults[0] || {})?.streams?.map(({ value }) => value) || [];
  const data = {
    labels: labels.reverse(),
    datasets: [
      {
        label: 'Streams',
        data: d.reverse(),
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
    <div className="App">
      <Row style={{ height: '100%' }} gutter={[2, 2]}>
        <Col span={8}>
          <section style={{ width: '300px', padding: '30px' }}>
            <SearchForm
              onSubmit={async (data) => {
                setInitLoading(true);
                const { artist, track, album, dates = [] } = data;
                const [startDate, endDate] = dates.map((d) =>
                  d.format('YYYY-MM-DD')
                );
                //console.log(startDate, endDate);
                const spotifySearchResult = await searchSpotify({
                  track,
                  artist,
                  album,
                });
                const uuidResult = await addSoundChartsId(spotifySearchResult);
                const songsWithUUID = uuidResult.filter((s) => !s.error);
                const uuidErrors = uuidResult.filter((s) => s.error);
                if (uuidErrors.length) {
                  console.log(uuidErrors);
                }
                const results = await addSpotifyStreamCount({
                  songs: songsWithUUID,
                  startDate,
                  endDate,
                });
                const streamCountErrors = results.filter((r) => r.error);
                const validResults = results.filter((r) => !r.error);
                if (streamCountErrors.length) {
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
            style={{ maxHeight: '300px', overflowY: 'scroll', padding: '30px' }}
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
          <section style={{ padding: '30px' }}></section>
        </Col>

        <Col span={16}>
          <section style={{ padding: '30px' }}>
            <Chart data={data} />
          </section>
        </Col>
      </Row>
    </div>
  );
};

export default Newtab;
