import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import './PostPage.css';
import moment from 'moment';
import StreamPage from './StreamPage';

axios.defaults.withCredentials = true;

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
  const [isUserPost, setIsUserPost] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const startStreaming = () => {
    setIsStreaming(true);
  };
  console.log(isStreaming)

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:10000/getPost`, { params: {post_id: id} } );
        if (response.status === 404) {
          console.error('Post not found');
          return;
        }
        setPost(response.data); 
        console.log(response.data);
        setIsUserPost(response.data.isuserpost || false); 
        console.log(response.data.isuserpost);
        setStarCount(response.data.stars || 0);
        console.log(response.data.stars);

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
        console.log(publicationsResponse.data);
        const commentsResponse = await axios.get(`http://localhost:10000/comments`);
        const commentsByPublicationId = commentsResponse.data.reduce((acc, comment) => {
          if (!acc[comment.publication_id]) {
            acc[comment.publication_id] = [];
          }
          acc[comment.publication_id].push(comment);
          return acc;
        }, {});
        setComments(commentsByPublicationId);
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

  const handleNewComment = async (publicationId, commentText) => {
    try {
      const response = await axios.post(`http://localhost:10000/addComment`, { publication_id: publicationId, text: commentText });
      setComments(prevComments => [...prevComments, response.data]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLike = async (publicationId) => {
    console.log(publicationId);
    try {
      const response = await axios.put(`http://localhost:10000/updateLikes`, { publication_id: publicationId });
      const updatedPub = publications.map(pub => pub.id === publicationId ? response.data : pub);
      setPublications(updatedPub);
      return updatedPub.find(pub => pub.id === publicationId);
    } catch (error) {
      console.error(error);
    }
  };

  const handleStar = async () => {
    try {
      const response = await axios.put(`http://localhost:10000/updateStars`, { post_id: id });
      setStarCount(response.data.totalStars); 
      setPost(prevPost => ({ ...prevPost, stars: response.data.totalStars })); 
    } catch (error) {
      console.error(error);
    }
  };

  const Publication = ({ pub, handleLike, handleNewComment }) => {
    const [likeCount, setLikeCount] = useState(pub.likes || 0);
    const [showCommentField, setShowCommentField] = useState(false);
    const [newComment, setNewComment] = useState(''); 
  
    const handleLikeClick = async (publicationId) => {
      const updatedPub = await handleLike(publicationId);
      if (updatedPub) {
        setLikeCount(updatedPub.likes);
      }
    };
  
    const toggleCommentField = () => {
      setShowCommentField(!showCommentField);
    };
  
    return (
      <div className='publication'>
        <div className='header'>
          <h2>{pub?.title}</h2>
          <p>{pub?.time ? moment(pub.time).fromNow() : ''}</p>
        </div>
        <p>{pub?.description}</p>
        {pub?.image_url && <img src={pub.image_url} alt={pub.title} style={{maxWidth: '100%', height: 'auto'}} />}
        {handleLikeClick && <button onClick={() => handleLikeClick(pub?.id)}>Like {likeCount}</button>}
        <button onClick={toggleCommentField}>Comentar</button>
        {comments[pub?.id]?.map(comment => (
          <div key={comment.id}>
            <p>{comment.username}: {comment.text}</p>
            <p>{comment.time ? moment(comment.time).fromNow() : ''}</p>
          </div>
        ))}
        {showCommentField && (
        <>
          <input value={newComment} onChange={e => setNewComment(e.target.value)} />
          {handleNewComment && <button onClick={() => { handleNewComment(pub.id, newComment); setNewComment(''); }}>New Comment</button>}
        </>
      )}
      </div>
    );
  };

  return (
    <div className="master-container">
      <div className="post-bar">
        <div className="user-info">
          <h1>{post?.room_name}</h1>
          <h2>{post?.username}</h2> 
        </div>
        {handleStar && <button onClick={handleStar}>Star</button>}
        <span>{starCount}</span> 
        {isUserPost && <button onClick={() => setShowNewPublicationForm(!showNewPublicationForm)}>New Publication</button>}
      </div>
      {showNewPublicationForm && (
        <div className="post-section">
          {setNewPublication && (
            <>
              <input
                value={newPublication?.title}
                onChange={e => setNewPublication({ ...newPublication, title: e.target.value })}
                placeholder="Title"
              />
              <textarea
                value={newPublication?.description}
                onChange={e => setNewPublication({ ...newPublication, description: e.target.value })}
                placeholder="Description"
              />
            </>
          )}
          {handleFileUpload && <input
            type="file"
            onChange={handleFileUpload}
            placeholder="Image URL (optional)"
          />}
          {handleNewPublication && <button onClick={handleNewPublication}>Publish</button>}
        </div>
      )}
      <div className="post-container">
        {publications?.map(pub => (
          <Publication key={pub.id} pub={pub} handleLike={handleLike} handleNewComment={handleNewComment} />
        ))}
      </div>
      {chatRoomId?.current && <button className="enter-chat" onClick={() => window.location.href = `/main/chat/${chatRoomId.current}`}>Go to Chat Room</button>}
      {isStreaming ? (
        <StreamPage />
      ) : (
        <button onClick={startStreaming}>Start Streaming</button>
      )}
    </div>
  );
};

export default PostPage;