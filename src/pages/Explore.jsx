import { Link } from "react-router-dom";
import rentCategoryImage from "../assets/jpg/rentCategoryImage.jpg";
import sellCategoryImage from "../assets/jpg/sellCategoryImage.jpg";
import Slider from "../components/Slider";

const Explore = () => {
  return (
    <div>
      {/* <img
              src={rentCategoryImage}
              alt="rent"
              className="exploreCategory" 
            /> */}
     {/* <button type="submit">Login</button> */}
    <div className="explore">
      <header>
        <p className="pageHeader">Explore</p>
      </header>

      <main>
        {/* <Slider /> */}

        <p className="exploreCategoryHeading">Categories</p>

        <div className="exploreCategories">
          <Link to="/category/primary">
            <img
              src={rentCategoryImage}
              alt="rent"
              className="exploreCategoryImg"
            />
            <div className="exploreCategoryName">Primary School</div>
          </Link>
          <Link to="/category/secondary">
            <img
              src={sellCategoryImage}
              alt="sell"
              className="exploreCategoryImg"
            />
            <div className="exploreCategoryName">Secondary School</div>
          </Link>
        </div>
      </main>
    </div>
    </div>
  );
};

export default Explore;
