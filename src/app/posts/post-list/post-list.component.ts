import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-postlist',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})


export class PostListComponent implements OnInit, OnDestroy {

  posts: Post[] = [];
  postUpdateSubs: Subscription;
  isLoading: boolean = false;

  totalPosts = 0;
  pageSize = 2;
  pageSizeOptions = [1, 2, 5, 10];
  currentPage = 1;

  private authStatusSub: Subscription;
  userIsAutheticated = false;
  userId: string;

  constructor(private postsService: PostsService, private authService: AuthService) {
  }

  ngOnInit(): void {

    this.isLoading = true;

    this.postsService.getPosts(this.pageSize, this.currentPage);
    this.userId = this.authService.getUserId();
    this.postUpdateSubs = this.postsService.postUpdatedObserverListener()
      .subscribe((postData: { posts: Post[], postCount: number }) => {
        // new value is received that was using next with updated posts list..
        this.posts = postData.posts;
        this.isLoading = false;
        this.totalPosts = postData.postCount;
      }
        // ,()error ,() observer is completed, no more value expected
      );

    this.userIsAutheticated = this.authService.getIsAuth();

    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
      this.userIsAutheticated = isAuthenticated;
      this.userId = this.authService.getUserId();
    });
  }

  onDelete(deleteId: string): void {

    this.postsService.deletePost(deleteId).subscribe(() => {
      this.postsService.getPosts(this.pageSize, this.currentPage);
    });
  }

  /** Prevent Memory leak when this component is not in DOm by destroying elements that not needed such as
   * the subscription
   */
  ngOnDestroy(): void {
    this.postUpdateSubs.unsubscribe();
    this.authStatusSub.unsubscribe();
  }

  onChangePage(pageData: PageEvent) { // As event is passed by angular so angular would pass a pageevent.
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.pageSize = pageData.pageSize;
    this.postsService.getPosts(this.pageSize, this.currentPage);
  }
}
