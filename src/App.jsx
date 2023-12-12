import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  Container,
  InputGroup,
  FormControl,
  Button,
  Row,
  Card,
  CardBody,
  Modal
} from 'react-bootstrap';

const CLIENT_ID = 'd9fd3a49aaee466da41d4a9e1368f98c';
const CLIENT_SECRET = '162d8c66e5824e179bfcb9d19fde17c0';

function AlbumTracksModal({ show, onHide, albumId, accessToken }) {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    const fetchAlbumTracks = async () => {
      const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accessToken
        },
      });

      const data = await response.json();
      setTracks(data.items);
    };

    if (show) {
      fetchAlbumTracks();
    }
  }, [show, albumId, accessToken]);

  const startPlayback = async (trackUri) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accessToken,
        },
        body: JSON.stringify({
          uris: [trackUri],
        }),
      });

      if (response.status === 204) {
        console.log('Playback started successfully.');
      } else {
        console.error('Failed to start playback:', response.statusText);
      }
    } catch (error) {
      console.error('Error starting playback:', error);
    }
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static" keyboard={false} className='bg-transparent'>
      <Modal.Header closeButton className='bg-black'>
        <Modal.Title className='text-white'>Album Tracks by  </Modal.Title>
        <Button className='close' onClick={onHide}>&times;</Button>
      </Modal.Header>
      <Modal.Body className=''>
        <ul className='list-unstyled '>
          {tracks.map((track, index) => (
            <li className='hover:bg-slate-100 rounded-full p-2' key={index}>
              {track.name}
              <Button className='ml-2 text-slate-300 ' variant='success' onClick={() => startPlayback(track.uri)}>
                Play
              </Button>
            </li>
          ))}
        </ul>
      </Modal.Body>
    </Modal>
  );
}

function App() {
  const [accessToken, setAccessToken] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [showAlbumModal, setShowAlbumModal] = useState(false);

  useEffect(() => {
    const authParameters = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`
    };

    fetch('https://accounts.spotify.com/api/token', authParameters)
      .then(result => result.json())
      .then(data => setAccessToken(data.access_token))
      .catch(error => console.error('Error:', error));
  }, []);

  const handleAlbumClick = (albumId) => {
    setSelectedAlbum(albumId);
    setShowAlbumModal(true);
  };

  const handleCloseModal = () => {
    setSelectedAlbum(null);
    setShowAlbumModal(false);
  };

  async function search() {
    console.log("Searching For " + searchInput);

    var searchParameters = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
      },
    };

    var artistID = await fetch('https://api.spotify.com/v1/search?q=' + searchInput + '&type=artist', searchParameters)
      .then(response => response.json())
      .then(data => { return data.artists.items[0].id });
    console.log("Artist ID: " + artistID);

    var returnedAlbums = await fetch('https://api.spotify.com/v1/artists/' + artistID + '/albums?include_groups=album&market=US&limit=50', searchParameters)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setAlbums(data.items);
      });
  }

  return (
    <div id="App" className='bg-black px-3 text-black text-8xl font-bold'>
      <h1 className='bg-gradient-to-r from-white to-green-500 text-transparent bg-clip-text flex mt-5 justify-center'>
        Spotify
        <h1 className='text-white font-thin ml-2 '>slim</h1>
        <img src="/src/assets/Spotify.png" className='bg-black h-12 mt-5 ml-5' alt='logo' />
      </h1>
      <Container className=''>
        <InputGroup className='mb-3 scale-90  mt-5 w-120' size="lg">
          <FormControl
            placeholder='Search For Artist'
            type="text"
            onKeyDown={event => {
              if (event.key === 'Enter') {
                search();
              }
            }}
            onChange={event => setSearchInput(event.target.value)}
          />
          <Button
            className='hover:bg-pink-500 text-slate-400' onClick={search} >
            Search
          </Button>
        </InputGroup>
      </Container>

      <Container>
        <Row className=' mb-20  flex- justify-center row row-cols-5 '>
          {albums.map((album, i) => (
            <Card className='hover:border-green-600 mx-4 mb-4 mt-4 hover:scale-95 border-4  mx-2 px-2' key={i} onClick={() => handleAlbumClick(album.id)}>
              <Card.Img className='mt-2' src={album.images[0].url} />
              <CardBody>
                <Card.Title className='font-semibold'>{album.name}</Card.Title>
                <Card.Text className='text-xl text-slate-600'>Total Tracks</Card.Text>
                <Card.Text>{album.total_tracks}</Card.Text>
              </CardBody>
            </Card>
          ))}
        </Row>
      </Container>

      <AlbumTracksModal
        show={showAlbumModal}
        onHide={handleCloseModal}
        albumId={selectedAlbum}
        accessToken={accessToken}
      />
      <div className='bg-white/5 h-580 font-light mb-80 mx-20 p-5 rounded-md'>
        <h1 className='text-white flex justify-center text-8xl mb-10 font-normal'>About Me</h1>
        <div class="mt-16 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-y-16 lg:gap-x-8">
          <div class="border-t border-gray-200 pt-4">
            <dt class="font-medium text-2xl text-gray-300">Name</dt>
            <dd class="mt-2 text-sm text-gray-500">Cameron Norfleet</dd>
          </div>
          <div class="border-t border-gray-200 pt-4">
            <dt class="font-medium text-2xl text-gray-300">Favorite Genres</dt>
            <dd class="mt-2 text-sm text-gray-500">Rnb, Hip-Hop, Jazz, Alternative</dd>
          </div>
          <div class="border-t border-gray-200 pt-4">
            <dt class="font-medium text-2xl text-gray-300">Favorite Artists</dt>
            <dd class="mt-2 text-sm text-gray-500">
              <span class='bg-gradient-to-r from-white to-red-600 text-transparent bg-clip-text'></span>
              <span class='bg-gradient-to-r from-blue-300 to-pink-600 text-transparent bg-clip-text'>Yves Tumor, </span>Destiny's Child, James Blake
            </dd>
          </div>
          <div class="border-t border-gray-200 pt-4">
            <dt class="font-medium text-2xl text-gray-300">Technologies</dt>
            <dd class="mt-2 text-sm text-gray-500">TailwindCSS, React.js, Python, JSX, Javascript, Typescript</dd>
          </div>
          <div class="border-t border-gray-200 pt-4">
            <dt class="font-medium text-2xl text-gray-300">Skills</dt>
            <dd class="mt-2 text-sm text-gray-500">
              <span class='bg-gradient-to-r from-red-300 to-purple-600 text-transparent bg-clip-text'>Frontend</span>, Database Design,
              UX/UI, Project Management,
              <span class='bg-gradient-to-r from-white to-red-600 text-transparent bg-clip-text'>Data Analytics</span>, Product Design,
              <span class='bg-gradient-to-r from-green-300 to-yellow-600 text-transparent bg-clip-text'>Communication</span>
            </dd>
          </div>
          <div class="border-t border-gray-200 pt-4">
            <dt class="font-medium text-2xl text-gray-300">Cover Letter</dt>
            <dd class="mt-2 text-sm text-gray-500"> I am writing to express my strong interest in participating in the 2024 Summer Internship Program at Spotify. As a passionate Developer and Musician,<span class='bg-gradient-to-r from-green-300 to-yellow-600 text-transparent bg-clip-text'> I have had the unique privilege of exploring Spotify both as a consumer and creator, gaining valuable insights into its intricacies and potential for innovation. My journey with Spotify has been multifaceted, involving active use of services <span class='bg-gradient-to-r from-green-300 to-yellow-600 text-transparent bg-clip-text'></span>
            like  Spotify for Artists</span>  and spotify for developers. This experience has led me to envision a myriad of impactful technologies that can enhance the traditional listening and creating experiences on the platform. I am particularly keen on contributing to the development of tools that cater to both listeners and creators, <span class='bg-gradient-to-r from-red-300 to-purple-600 text-transparent bg-clip-text'> leveraging my deep understanding of Music Production, Music Theory, Audio Engineering, and Software Engineering.      
            My unique skill set as a Software Developer, UX/UI Designer, Product Developer & Analyst intersects seamlessly with my expertise in Musicianship.</span>   This convergence positions me to provide innovative and creative solutions to challenges that may arise in either the musical or technological domain. I am confident that my diverse background equips me with a comprehensive perspective that aligns well with the dynamic environment at Spotify.          
            One milestone in my journey as a Spotify artist was amassing 10k monthly listeners by landing on a Spotify playlist. This experience underscored the immense power of creating pathways for creatives to share their work. It was at this point that I realized the potential to build more tools and pathways for future creators. This realization has become a driving force behind my passion for contributing to the evolution of the Spotify ecosystem.         
            I am excited about the prospect of bringing my unique blend of skills, experiences, and insights to the Spotify team. <span class='bg-gradient-to-r from-blue-300 to-green-600 text-transparent bg-clip-text'>I am confident that my dedication to bridging the worlds of music and technology aligns with Spotify's commitment to fostering innovation</span> in the music streaming industry. I am eager to contribute to the continued success of Spotify and to be a part of a team that is at the forefront of shaping the future of music.
            Thank you for considering my application. I am looking forward to the opportunity to discuss how my background and skills can contribute to the vibrant and innovative culture at Spotify.
            </dd>
          </div>
        </div>
        {/* Frank */}
        <Container>
        <div class="border-t border-gray-200 pt-4 mt-5"/>

          <p className='text-white flex mt-10 font-bold justify-center text-6xl'>Favorite Albums</p>
          <Row className=' mb-20 sm:text-sm flex- justify-center row row-cols-5'>
            <Card className='hover:border-green-600 mx-4 mb-4 mt-4  hover:scale-95 border-2 px-2' onClick={() => handleAlbumClick('2h93pZq0e7k5yf4dywlkpM')}>
              <Card.Img className='rounded-lg mt-2' src="/src/assets/d'anglo.jpg" alt="Frank Ocean Album" />
              <CardBody>
                <Card.Title className='font-semibold '>D'Angelo</Card.Title>
                <Card.Text className='text-xl text-slate-600'>Voodoo</Card.Text>
                <Card.Text className=''>1999</Card.Text>
              </CardBody>
            </Card>
            {/* Yves Tumor */}
            <Card className='hover:border-green-600 mx-4 mb-4 mt-4 hover:scale-95 border-4  mx-2 px-2' onClick={() => handleAlbumClick('7CajNmpbOovFoOoasH2HaY')}>
              <Card.Img className='mt-2' src="/src/assets/yves.webp" alt="Yves Tumor Album" />
              <CardBody>
                <Card.Title className='font-semibold'>Yves Tumor </Card.Title>
                <Card.Text className='text-xl text-slate-600'>Htatm</Card.Text>
                <Card.Text>2020</Card.Text>
              </CardBody>
            </Card>
            <Card className='hover:border-green-600 mx-4 mb-4 mt-4  hover:scale-95 border-2 px-2' onClick={() => handleAlbumClick('2h93pZq0e7k5yf4dywlkpM')}>
            <Card.Img className='rounded-lg mt-2' src="/src/assets/blonde.jpg" alt="Frank Ocean Album" />
            <CardBody>
              <Card.Title className='font-semibold '>Frank Ocean</Card.Title>
              <Card.Text className='text-xl text-slate-600'>Blonde</Card.Text>
              <Card.Text className=''>2016</Card.Text>
            </CardBody>
          </Card>
            <Card className='hover:border-green-600 mx-4 mb-4 mt-4  hover:scale-95 border-2 px-2' onClick={() => handleAlbumClick('2h93pZq0e7k5yf4dywlkpM')}>
              <Card.Img className='rounded-lg mt-2' src="/src/assets/kennybeats.webp" alt="Frank Ocean Album" />
              <CardBody>
                <Card.Title className='font-semibold '>Kenny Beats</Card.Title>
                <Card.Text className='text-xl text-slate-600'>Louie</Card.Text>
                <Card.Text className=''>2022</Card.Text>
              </CardBody>
            </Card>
          </Row>
        </Container>
      </div>
    </div>
  );
}

export default App;
