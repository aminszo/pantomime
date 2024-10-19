<?php

namespace App\Models;

use App\Models\Words;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Category extends Model
{

    // protected $table = 'categories';

    use HasFactory;

    protected $fillable = [
        'fa_name',
        'en_name',
        'category_id',
        'score',
        'type',
    ];

    // Define the relationship with ContentAdabazi
    public function words()
    {
        return $this->hasMany(Words::class, 'category_id', 'category_id');
    }
}
