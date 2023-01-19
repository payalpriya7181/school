import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  updateDoc,
  doc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase.config";
import { getAuth, updateProfile } from "firebase/auth";
import { toast } from "react-toastify";
import ListingItem from "../components/ListingItem";
import arrowRight from "../assets/svg/keyboardArrowRightIcon.svg";
import homeIcon from "../assets/svg/homeIcon.svg";

const Profile = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState(null);
  const [changeDetails, setChangeDetails] = useState(false);

  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  });

  const { name, email } = formData; //Destructuring it for data.

  const onLogout = (e) => {
    auth.signOut();
    navigate("/");
  };

  useEffect(() => {
    const fetchUserListings = async () => {
      const listingRef = collection(db, "listings");

      const q = query(
        listingRef,
        where("userRef", "==", auth.currentUser.uid),
        orderBy("timestamp", "desc")
      );
      const querySnap = await getDocs(q);

      let listings = [];

      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });

      setListings(listings);
      setLoading(false);
    };

    fetchUserListings();
  }, [auth.currentUser.uid]);

  const onDelete = async (listingId) => {
    if (window.confirm("Are you sure you want to delete?")) {
      await deleteDoc(doc(db, "listings", listingId));
      const updatedListings = listings.filter(
        (listing) => listing.id !== listingId
      );
      setListings(updatedListings);
      toast.success("Successfully deleted listing");
    }
  };

  const onSubmit = async (e) => {
    try {
      //Update Display Name in Firebase
      await updateProfile(auth.currentUser, {
        displayName: name,
      });

      //Update in firestore
      const userRef = doc(db, "users", auth.currentUser.uid);
      updateDoc(userRef, {
        name,
      });
    } catch (error) {
      toast.error("Could not update profile details");
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  const onEdit = (listingId) => navigate(`/edit-listing/${listingId}`);

  return (
    <>
      <div className="profile">
        <header className="profileHeader">
          <p className="pageHeader">My Profile</p>
          <button type="button" className="logOut" onClick={onLogout}>
            Logout
          </button>
        </header>
        <main>
          <div className="profileDetailsHeader">
            <p className="profileDetailsText">Personal Details</p>
            <p
              className="changePersonalDetails"
              onClick={() => {
                setChangeDetails((prevState) => !prevState);
                onSubmit();
              }}
            >
              {changeDetails ? "done" : "change"}
            </p>
          </div>

          <div className="profileCard">
            <form>
              <input
                type="text"
                id="name"
                className={!changeDetails ? "profileName" : "profileNameActive"}
                disabled={!changeDetails}
                value={name}
                onChange={handleChange}
              />
              <input
                type="text"
                id="email"
                className={
                  !changeDetails ? "profileEmail" : "profileEmailActive"
                }
                disabled={!changeDetails}
                value={email}
                onChange={handleChange}
              />
            </form>
          </div>

          <Link to="/create-listing" className="createListing">
            <img src={homeIcon} alt="home-icon" />
            <p>Sell or rent your home</p>
            <img src={arrowRight} alt="arrow-right" />
          </Link>
          {!loading && listings.length > 0 && (
            <>
              <p className="listingText">Your Listings</p>
              <ul className="listingsList">
                {listings.map((listing) => (
                  <ListingItem
                    key={listing.id}
                    listing={listing.data}
                    id={listing.id}
                    onDelete={() => onDelete(listing.id)}
                    onEdit={() => onEdit(listing.id)}
                  />
                ))}
              </ul>
            </>
          )}
        </main>
      </div>
    </>
  );
};

export default Profile;
