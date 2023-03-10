import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
import ListingItem from "../components/ListingItem";

const Offers = () => {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        // Get Reference
        const listingRef = collection(db, "listings");

        // Create a query
        const q = query(
          listingRef,
          where("scholarship", "==", true),
          orderBy("timestamp", "desc"),
          limit(10)
        );

        //Execute Query
        const querySnap = await getDocs(q);

        const listings = [];

        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });

        setListings(listings);
        console.log(listings)
        setLoading(false);
      } catch (error) {
        console.log(error)
        toast.error("Could not fetch listings");
      }
    };

    fetchListings();
  }, []);
  return (
    <div className="category">
      <header>
        <p className="pageHeader">Scholarship</p>
      </header>

      {loading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        <>
          <main>
            <ul className="categoryListings">
              {listings.map((listing) => (
                <ListingItem
                  listing={listing.data}
                  id={listing.id}
                  key={listing.id}
                />
              ))}
            </ul>
          </main>
        </>
      ) : (
        <p>There are no current Offers</p>
      )}
    </div>
  );
};

export default Offers;