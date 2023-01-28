import { useState, useEffect, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { updateDoc, getDoc, serverTimestamp, doc } from "firebase/firestore";
import { db } from "../firebase.config";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

const EditListing = () => {
  const [geolocationEnabled, setGeolocationEnabled] = useState(false);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "primary",
    name: "",
    // bedrooms: 1,
    // bathrooms: 1,
    busService: false,
    cctv: false,
    labs: true,
    canteen: true,
    sportsFacilities: true,
    // parking: false,
    // furnished: false,
    address: "",
    contact: "",
    scholarship: false,
    discount: "",
    brochure: "",
    // regularPrice: 0,
    // discountedPrice: 0,
    images: {},
    latitude: 0,
    longitude: 0,
  });

  const {
    type,
    name,
    contact,
    // bedrooms,
    // bathrooms,
    // parking,
    busService,
    cctv,
    labs,
    canteen,
    sportsFacilities,
    address,
    scholarship,
    brochure,
    // regularPrice,
    // discountedPrice,
    discount,
    images,
    latitude,
    longitude,
  } = formData;

  console.log(formData)

  const auth = getAuth();
  const navigate = useNavigate();
  const params = useParams();

  //In case of memory leaks.
  const isMounted = useRef(true);

  // Redirect if listing is not user's
  useEffect(() => {
    if (listing && listing.userRef !== auth.currentUser.uid) {
      toast.error("You can't edit that listing");
      navigate("/");
    }
  });
  //Fetch listing to edit
  useEffect(() => {
    setLoading(true);
    const fetchListing = async () => {
      const docRef = doc(db, "listings", params.listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setListing(docSnap.data());
        setFormData({ ...docSnap.data(), address: docSnap.data().address });
        setLoading(false);
      } else {
        navigate("/");
        toast.error("listing doesn't exists");
      }
    };

    fetchListing();
  }, [navigate, params.listingId]);

  // Set userRef to logged In User
  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setFormData({ ...formData, userRef: user.uid });
        } else {
          navigate("/sign-in");
        }
      });
    }

    return () => (isMounted.current = false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  if (loading) {
    <Spinner />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // if (discountedPrice >= regularPrice) {
    //   setLoading(false);
    //   toast.error("Discounted price needs to be less than regular price");
    //   return;
    // }

    if (images.length > 6) {
      setLoading(false);
      toast.error("Max 6 images");
      return;
    }

    let geolocation = {};

    if (geolocationEnabled) {
      // Call the api from here, when enabled :(
      //Enable geocoding api key from google cloud console, and await the response from here.
    } else {
      geolocation.lat = latitude;
      geolocation.lng = longitude;

      // console.log(geolocation, location);
    }

    //Store Image in firebase (get this from documentation)
    const storeImage = async (image) => {
      return new Promise((resolve, reject) => {
        const storage = getStorage();
        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;

        const storageRef = ref(storage, "images/" + fileName);

        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
            switch (snapshot.state) {
              case "paused":
                console.log("Upload is paused");
                break;
              case "running":
                console.log("Upload is running");
                break;
              default:
                break;
            }
          },
          (error) => {
            reject(error);
          },
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    };

    const imgUrls = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch(() => {
      setLoading(false);
      toast.error("Images not uploaded");
      return;
    });

    const formDataCopy = {
      ...formData,
      imgUrls,
      geolocation,
      timestamp: serverTimestamp(),
    };

    

    // formDataCopy.location = address;
    delete formDataCopy.images;
    // delete formDataCopy.address;
    // !formDataCopy.offer && delete formDataCopy.discountedPrice;

    const docRef = await doc(db, "listings", params.listingId);
    await updateDoc(docRef, formDataCopy);
    setLoading(false);
    toast.success("Listing Saved");
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);
  };

  const onMutate = (e) => {
    let boolean = null;

    if (e.target.value === "true") {
      boolean = true;
    }

    if (e.target.value === "false") {
      boolean = false;
    }

    //Files
    if (e.target.files) {
      setFormData((prevState) => ({ ...prevState, images: e.target.files }));
    }

    //Text/Booleans/Numbers

    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }
  };

  if (loading) {
    return <Spinner />;
  }
  return (
    <div className="profile">
      <header>
        <p className="pageHeader">Edit School Information</p>
      </header>

      <main>
        <form onSubmit={handleSubmit}>
          <label className="formLabel">Category</label>
          <div className="formButtons">
            <button
              type="button"
              className={type === "primary" ? "formButtonActive" : "formButton"}
              id="type"
              value="primary"
              onClick={onMutate}
            >
              Primary
            </button>
            <button
              type="button"
              className={
                type === "secondary" ? "formButtonActive" : "formButton"
              }
              id="type"
              value="secondary"
              onClick={onMutate}
            >
              Secondary
            </button>
          </div>

          <label className="formLabel">Name</label>
          <input
            className="formInputName"
            type="text"
            id="name"
            value={name}
            onChange={onMutate}
            maxLength="32"
            minLength="10"
            required
          />

          <label className="formLabel">Contact Number</label>
          <input
            className="formInputName"
            type="text"
            id="contact"
            value={contact}
            onChange={onMutate}
            maxLength="10"
            minLength="10"
            required
          />

          {/* <div className="formRooms flex">
            <div>
              <label className="formLabel">Bedrooms</label>
              <input
                className="formInputSmall"
                type="number"
                id="bedrooms"
                value={bedrooms}
                onChange={onMutate}
                min="1"
                max="50"
                required
              />
            </div>
            <div>
              <label className="formLabel">Bathrooms</label>
              <input
                className="formInputSmall"
                type="number"
                id="bathrooms"
                value={bathrooms}
                onChange={onMutate}
                min="1"
                max="50"
                required
              />
            </div>
          </div> */}

          <label className="formLabel">Scholarship</label>
          <div className="formButtons">
            <button
              className={scholarship ? "formButtonActive" : "formButton"}
              type="button"
              id="scholarship"
              value={true}
              onClick={onMutate}
              min="1"
              max="50"
            >
              Yes
            </button>
            <button
              className={
                !scholarship && scholarship !== null
                  ? "formButtonActive"
                  : "formButton"
              }
              type="button"
              id="scholarship"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          {scholarship && (
            <>
              <label className="formLabel">Upto</label>
              <div className="formPriceDiv">
                <input
                  className="formInputSmall"
                  type="number"
                  id="discount"
                  value={discount}
                  onChange={onMutate}
                  min="5"
                  max="100"
                  required
                />
                <p className="formPriceText">% Scholarship</p>
              </div>
            </>
          )}

          <label className="formLabel">Bus Service</label>
          <div className="formButtons">
            <button
              className={busService ? "formButtonActive" : "formButton"}
              type="button"
              id="busService"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !busService && busService !== null
                  ? "formButtonActive"
                  : "formButton"
              }
              type="button"
              id="busService"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className="formLabel">CCTV Available?</label>
          <div className="formButtons">
            <button
              className={cctv ? "formButtonActive" : "formButton"}
              type="button"
              id="cctv"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !cctv && cctv !== null ? "formButtonActive" : "formButton"
              }
              type="button"
              id="cctv"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className="formLabel">Labs Available?</label>
          <div className="formButtons">
            <button
              className={labs ? "formButtonActive" : "formButton"}
              type="button"
              id="labs"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !labs && labs !== null ? "formButtonActive" : "formButton"
              }
              type="button"
              id="labs"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className="formLabel">Canteen?</label>
          <div className="formButtons">
            <button
              className={canteen ? "formButtonActive" : "formButton"}
              type="button"
              id="canteen"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !canteen && canteen !== null ? "formButtonActive" : "formButton"
              }
              type="button"
              id="canteen"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>
          <label className="formLabel">Sports Facilities?</label>
          <div className="formButtons">
            <button
              className={sportsFacilities ? "formButtonActive" : "formButton"}
              type="button"
              id="sportsFacilities"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !sportsFacilities && sportsFacilities !== null
                  ? "formButtonActive"
                  : "formButton"
              }
              type="button"
              id="sportsFacilities"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className="formLabel">Address</label>
          <textarea
            className="formInputAddress"
            type="text"
            id="address"
            value={address}
            onChange={onMutate}
            required
          />

          <label className="formLabel">Brochure</label>
          <input
            className="formInputName"
            type="text"
            id="brochure"
            value={brochure}
            onChange={onMutate}
            maxLength="9000000"
            minLength="10"
          />
          {/* <label className="formLabel">Type</label>
          <textarea
            className="formInputAddress"
            type="text"
            id="type"
            // value={address}
            onChange={onMutate}
            required
          /> */}

          {!geolocationEnabled && (
            <div className="formLatLng flex">
              <div>
                <label className="formLabel">Latitude</label>
                <input
                  className="formInputSmall"
                  type="number"
                  id="latitude"
                  value={latitude}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label className="formLabel">Longitude</label>
                <input
                  className="formInputSmall"
                  type="number"
                  id="longitude"
                  value={longitude}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          )}

          {/* <label className="formLabel">Offer</label>
          <div className="formButtons">
            <button
              className={offer ? "formButtonActive" : "formButton"}
              type="button"
              id="offer"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !offer && offer !== null ? "formButtonActive" : "formButton"
              }
              type="button"
              id="offer"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div> */}

          {/* {offer && (
            <>
              <label className="formLabel">Discounted Price</label>
              <input
                className="formInputSmall"
                type="number"
                id="discountedPrice"
                value={discountedPrice}
                onChange={onMutate}
                min="50"
                max="750000000"
                required={offer}
              />
            </>
          )} */}

          <label className="formLabel">Images</label>
          <p className="imagesInfo">
            The first image will be the cover (max 6).
          </p>
          <input
            className="formInputFile"
            type="file"
            id="images"
            onChange={onMutate}
            max="6"
            accept=".jpg,.png,.jpeg"
            multiple
            required
          />
          <button type="submit" className="primaryButton createListingButton">
            Save Changes
          </button>
        </form>
      </main>
    </div>
  );
};

export default EditListing;
