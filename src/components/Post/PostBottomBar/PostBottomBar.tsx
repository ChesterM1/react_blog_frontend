import styles from './postBottomBar.module.scss';
import viewIcon from '../../../img/view.svg';
import commentIcon from '../../../img/comments.svg';
import heartRed from '../../../img/heart-svgrepo-com .svg';
import heart from '../../../img/heart.svg';
import { BottomBarPropsInterface } from './types';
import { useAppSelector } from '../../../redux/store';

const PostBottomBar: React.FC<BottomBarPropsInterface> = ({
    comment,
    view,
    like,
    props,
    scrollToComment,
}) => {
    const isAuth = useAppSelector((state) => state.auth.isAuth);
    const { createdAt, viewCount, addLike, unLike, handleLIKE, commentCount } = props;

    const clickLike = () => {
        if (!isAuth) {
            return;
        }

        if (handleLIKE?.isLiked) {
            return unLike?.();
        }
        addLike?.();
    };

    return (
        <div className={styles.bottom}>
            <div className={styles.right}>
                {view && (
                    <div>
                        <img src={viewIcon} alt='view' />
                        <span>{viewCount}</span>
                    </div>
                )}
                {comment && (
                    <div onClick={() => scrollToComment?.()} className={styles.active}>
                        <img src={commentIcon} alt='comment' />
                        <span>{commentCount}</span>
                    </div>
                )}
                {like && (
                    <div onClick={clickLike} className={isAuth ? styles.active : ''}>
                        <img
                            src={handleLIKE?.isLiked && isAuth ? heartRed : heart}
                            className={styles.heart}
                            alt='like'
                        />
                        <span>{handleLIKE?.likeCount}</span>
                    </div>
                )}
            </div>
            <div>
                <span className={styles.time}>{createdAt}</span>
            </div>
        </div>
    );
};

export default PostBottomBar;
