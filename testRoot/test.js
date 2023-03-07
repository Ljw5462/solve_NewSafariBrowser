const http = require('http');

// 서울시 마포구 백범로31길 21 좌표
const targetLocation = {
  latitude: 37.5531224,
  longitude: 126.9368018,
};

// 일정 반경(m) 내에 위치하는지 체크하는 함수
const isWithinRadius = (lat1, lon1, lat2, lon2, radius) => {
  const R = radius; // 반경(m)
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // 두 지점 사이의 거리(m)
  return d <= R;
};

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    // 클라이언트의 위치 정보 추출
    const lat = req.headers['latitude'];
    const lon = req.headers['longitude'];
    const clientPosition = { latitude: lat, longitude: lon };

    // 일정 URL에 대해서 위치 정보 체크를 수행
    if (isWithinRadius(clientPosition.latitude, clientPosition.longitude, targetLocation.latitude, targetLocation.longitude, 200)) {
      // 일정 반경 내에 있을 경우 실행되는 코드
      res.statusCode = 200;
      res.end('Access granted');
    } else {
      // 일정 반경 외에 있을 경우 실행되는 코드
      res.statusCode = 403;
      res.end('Access denied');
    }
  } else if (req.url === '/getLocation') {
    // 위치 정보를 가져오기 위한 함수
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(sendLocation);
      } else {
        alert("Geolocation is not supported by this browser.");
      }
    }

    // 위치 정보 전송 함수
    const sendLocation = (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      // 서버로 전송할 HTTP 요청 헤더 구성
      const headers = {
        'latitude': latitude,
        'longitude': longitude
      };

      // 서버로 HTTP 요청 보내기
      fetch('/', { headers })
        .then(response => {
          if (response.ok) {
            // 서버로부터 응답이 성공적으로 왔을 때 실행되는 코드
            console.log('Access granted');
          } else {
            // 서버로부터 응답이 실패했을 때 실행되는 코드
            console.log('Access denied');
          }
        });
    }

    // 위치 정보 가져오기
    getLocation();
  } else {
    res.statusCode = 404;
    res.end('Not found');
  }
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});