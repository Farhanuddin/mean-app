import { Component, OnInit } from '@angular/core';
import { Post } from '../post.model';
import { NgForm, FormGroup, FormControl, Validators } from '@angular/forms';
import { PostsService } from '../posts.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { mimeType } from '../validators/mime-type-validator';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})

export class PostCreateComponent implements OnInit {

  private mode = 'create';
  private postId: string;
  post: Post;
  isLoading: boolean = false;
  form: FormGroup;
  imagePreview: any;

  constructor(private postsService: PostsService, private route: ActivatedRoute) {

  }

  ngOnInit() {

    this.form = new FormGroup({
      'title': new FormControl(null,
        {
          validators: [Validators.required, Validators.minLength(3)]
        }),
      'content': new FormControl(null, {
        validators: [Validators.required]
      }),
      'image': new FormControl(null, {
        validators: [Validators.required], asyncValidators: [mimeType]
      })
    });

    // As we are subscribing to this builtin route observer, this will be called everytime the route changes..
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');

        this.isLoading = true;
        // Get Edit Post data for this post from Service..
        this.postsService.getPost(this.postId).subscribe((postData) => {

          this.isLoading = false;
          this.post = {
            id: postData._id, title: postData.title, content: postData.content,
            imagePath: postData.imagePath, creator: postData.creator
          };

          this.form.setValue({
            title: this.post.title,
            content: this.post.content,
            image: this.post.imagePath
          });
        });

      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  onSavePost(): void {

    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create') {

      this.postsService.addPost(this.form.value.title, this.form.value.content, this.form.value.image);
    } else {
      console.log(this.form.value);
      this.postsService.updatePost(

        this.postId, this.form.value.title, this.form.value.content, this.form.value.image);
    }

    this.form.reset();
  }

  onImagePicked(event: Event): any {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file });
    this.form.get('image').updateValueAndValidity();

    // Convert image to data url for preview
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };

    reader.readAsDataURL(file);

    console.log(file);
    console.log(this.form);
  }
}
