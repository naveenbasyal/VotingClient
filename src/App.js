import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import { ClipLoader } from "react-spinners";

const App = () => {
  const [images, setImages] = useState([]);
  const [currentImages, setCurrentImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoteLoading, setIsVoteLoading] = useState(null);

  const [highlightedImage, setHighlightedImage] = useState(null);

  useEffect(() => {
    setSelectedImage(null);
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setIsLoading(true);
    axios
      .get(`${process.env.REACT_APP_BASE_URL}/api/images`)
      .then((response) => {
        setImages(response.data);
        setCurrentImages(response.data.slice(0, 2));
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching images:", error);
        setIsLoading(false);
      });
  };

  const handleVote = (id) => {
    if (selectedImage === null) {
      axios
        .patch(`${process.env.REACT_APP_BASE_URL}/api/images/${id}/vote`)
        .then((response) => {
          setCurrentImages((prevImages) =>
            prevImages.map((image) => {
              if (image._id === response.data._id) {
                return response.data;
              }
              return image;
            })
          );
          setIsVoteLoading(null);

          setSelectedImage(id);
          setHighlightedImage(id);
        })
        .catch((error) => {
          console.error("Error updating vote count:", error);
          setIsVoteLoading(false);
        });
    }
  };

  const handleNext = (e) => {
    setSelectedImage(null);
    fetchImages();
    // Add animation class to the button
    e.target.classList.add("animate");
    setTimeout(function () {
      e.target.classList.remove("animate");
    }, 700);
  };
  const calculateVotePercentage = (image) => {
    if (image.voteCount === 0) {
      return 0;
    }
    const totalVotes = currentImages.reduce(
      (total, img) => total + img.voteCount,
      0
    );
    const percentage = (image.voteCount / totalVotes) * 100;
    return Math.round(percentage);
  };

  return (
    <div className="container my-5 main">
      <h1 className="center">Vote for your favorite image</h1>
      <div className="image-grid row my-5 justify-content-around">
        {isLoading ? (
          <div className="center my-5 py-5">
            <ClipLoader size={50} color="#ff7979" className="fw-bolder" />
          </div>
        ) : (
          currentImages.map((image) => (
            <div
              key={image._id}
              className="col-sm-2 col-md-3 col-lg-3 d-flex flex-column"
            >
              <div
                className="image_container"
                style={{
                  border:
                    highlightedImage === image._id
                      ? "8px solid #ff7979"
                      : "5px solid transparent",
                  borderRadius: highlightedImage === image._id && "50%",
                }}
              >
                <img
                  src={image.imageUrl}
                  alt={`Image ${image._id}`}
                  className="img-fluid img"
                />
              </div>
              {selectedImage === null ? (
                <button
                  className="my-3 vote_btn center"
                  onClick={(e) => {
                    setIsVoteLoading(image._id);
                    handleVote(image._id);
                    e.target.classList.add("animate");
                    setTimeout(function () {
                      e.target.classList.remove("animate");
                    }, 700);
                  }}
                >
                  {isVoteLoading === image._id ? (
                    <ClipLoader size={20} color="#fff" className="fw-bolder" />
                  ) : (
                    "Vote"
                  )}
                </button>
              ) : (
                <p className="vote_percentage">
                  Vote percentage:{" "}
                  <strong>{calculateVotePercentage(image)}%</strong>
                </p>
              )}
            </div>
          ))
        )}
      </div>

      <div className="center ">
        <button
          onMouseOver={(e) => {
            e.target.classList.add("animate");
            setTimeout(function () {
              e.target.classList.remove("animate");
            }, 700);
          }}
          className="bubbly-button my-4 px-3 py-2 center"
          onClick={handleNext}
        >
          {isLoading ? (
            <ClipLoader size={30} color="#fff" className="fw-bolder" />
          ) : (
            "Next"
          )}
        </button>
      </div>
    </div>
  );
};

export default App;
