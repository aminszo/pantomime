<?php

namespace App\Models;

use App\Models\Category;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Words extends Model
{
    use HasFactory;

    protected $table = 'words_content';

    protected $fillable = [
        'content',
        'score',
        'category_id',
    ];

    // Define the relationship with Category
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'category_id');
    }
}
