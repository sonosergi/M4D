import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import './PostPage.css';
import moment from 'moment';

axios.defaults.withCredentials = true;
moment.locale('es');

const PostPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [post, setPost] = useState(null);
  const [publications, setPublications] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRoomId = useRef(null);
  const [newPublication, setNewPublication] = useState({
    post_id: id,
    title: '',
    description: '',
    image_url: '',
    likes: 0
  });
  const [showNewPublicationForm, setShowNewPublicationForm] = useState(false);
  const [starCount, setStarCount] = useState(0);



  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:10000/post/${id}`);
        if (response.status === 404) {
          console.error('Post not found');
          return;
        }
        setPost(response.data);
        if (!chatRoomId.current) {
          const chatRoomResponse = await axios.get(`http://localhost:7000/get_id_chat`, {
            params: {
              lat: location.state.lat,
              lng: location.state.lng
            }
          });
          chatRoomId.current = chatRoomResponse.data.id;
        }
        const publicationsResponse = await axios.get(`http://localhost:10000/publications`, { params: { post_id: id } });
        setPublications(publicationsResponse.data);
        const commentsResponse = await axios.get(`http://localhost:10000/comments`);
        setComments(commentsResponse.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
  
    if (!loading) {
      fetchPost();
    }
  }, [id, location.state]);

  const handleNewPublication = async () => {
    try {
      const response = await axios.post(`http://localhost:10000/publication`, newPublication);
      setPublications([...publications, response.data]);
      setNewPublication({
        post_id: id,
        title: '',
        description: '',
        image_url: '',
        user_id: '',
        likes: 0
      });
      setShowNewPublicationForm(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileUpload = async (event) => {
    try {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append('image', file);
  
      const response = await axios.post('http://localhost:10000/uploads', formData);
  
      if (response.status === 200) {
        setNewPublication((prev) => ({
          ...prev,
          image_url: `http://localhost:10000/uploads/${response.data.filename}`,
        }));
      } else {
        console.error('Failed to upload image');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleNewComment = async () => {
    try {
      const response = await axios.post(`http://localhost:10000/comment`, { text: newComment });
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleLike = async (publicationId) => {
    try {
      const response = await axios.put(`http://localhost:10000/publication/${publicationId}/likes`);
      setPublications(publications.map(pub => pub.id === publicationId ? response.data : pub));
    } catch (error) {
      console.error(error);
    }
  };

  const handleStar = async () => {
    try {
      const response = await axios.put(`http://localhost:10000/updateStars`, { post_id: id });
      setStarCount(response.data.stars);
      setPost(prevPost => ({ ...prevPost, stars: response.data.stars }));
    } catch (error) {
      console.error(error);
    }
  };

  const Publication = ({ pub, handleLike, handleNewComment }) => {
    return (
      <div className='publication'>
        <div className='header'>
          <h2>{pub.title}</h2>
          <p>{moment(pub.time).fromNow()}</p>
        </div>
        <p>{pub.description}</p>
        {pub.image_url && <img src={pub.image_url} alt={pub.title} style={{maxWidth: '100%', height: 'auto'}} />}
        <button onClick={() => handleLike(pub.id)}>Like</button>
        <input value={newComment} onChange={e => setNewComment(e.target.value)} />
        <button onClick={handleNewComment}>New Comment</button>
      </div>
    );
  };

  return (
    <div className="master-container">
      <div className="post-bar">
        <h1>{post?.room_name}</h1>
        <button onClick={handleStar}>Star</button>
        <span>{starCount}</span> 
        <button onClick={() => setShowNewPublicationForm(!showNewPublicationForm)}>New Publication</button>
      </div>
      {showNewPublicationForm && (
        <div className="post-section">
          <input
            value={newPublication.title}
            onChange={e => setNewPublication({ ...newPublication, title: e.target.value })}
            placeholder="Title"
          />
          <textarea
            value={newPublication.description}
            onChange={e => setNewPublication({ ...newPublication, description: e.target.value })}
            placeholder="Description"
          />
          <input
            type="file"
            onChange={handleFileUpload}
            placeholder="Image URL (optional)"
          />
          <button onClick={handleNewPublication}>Publish</button>
        </div>
      )}
      <div className="post-container">
      {publications.map(pub => (
        <Publication key={pub.id} pub={pub} handleLike={handleLike} handleNewComment={handleNewComment} />
      ))}
      </div>
      {chatRoomId.current && <button className="enter-chat" onClick={() => window.location.href = `/main/chat/${chatRoomId.current}`}>Go to Chat Room</button>}
    </div>
  );
};

export default PostPage;