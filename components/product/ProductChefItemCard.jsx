const ProductChefItemCard = ({ chefChoice }) => {
    return (
        <div className="chef-item relative">
            <div className="ch-image">
                <a href="" title="">
                    {chefChoice.thumbnail !== null && <img src={chefChoice.thumbnail} alt="" title="" />}
                    {chefChoice.thumbnail === null && <img src={chefChoice.imagePath} alt="" title="" />}
                </a>
            </div>
            <div className="ch-text text-center">
                <h3 className="title-sm mgb-10">
                    <a href="" title="">{chefChoice.title }</a>
                </h3>
                <p className="desc text-gray font-18">
                    { chefChoice.description }
                </p>
            </div>
            <div className="text-center order-abs">
                <button className="btn btn-yellow btn-h60 font-18 font-demi">ORDER NOW</button>
            </div>
        </div>
    )
}

export default ProductChefItemCard;