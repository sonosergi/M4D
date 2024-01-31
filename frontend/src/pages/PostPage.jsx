import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import './PostPage.css';

axios.defaults.withCredentials = true;

const PostPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const chatRoomId = useRef(null);

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
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
  
    if (!loading) {
      fetchPost();
    }
  }, [id, location.state]); // Remove chatRoomId from dependencies

  return (
    <div className="master-container">
      <div className="post-bar">
        <h1>{post?.room_name}</h1>
      </div>
      <div className="post-container">
        {/* Aquí puedes mostrar las publicaciones */}
      </div>
      <div className="post-section">
        {/* Aquí puedes agregar el formulario para crear nuevas publicaciones */}
      </div>
      {chatRoomId.current && <button onClick={() => window.location.href = `/main/chat/${chatRoomId.current}`}>Go to Chat Room</button>}
    </div>
  );
};

export default PostPage;