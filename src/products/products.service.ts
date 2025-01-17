import { HttpStatus, Injectable, Logger, NotFoundException, OnModuleInit, Param } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('ProductsService');

  onModuleInit() {
    this.$connect()

    this.logger.log('Conectado a la base de datos');
  }
  create(createProductDto: CreateProductDto) {

    const { name, price } = createProductDto

    return this.product.create({ data: { name, price } })

  }

  async findAll(paginationDto: PaginationDto) {
  
    const { limit, page } = paginationDto
    
    const totalPages = await this.product.count()
    const lastPage = Math.ceil(totalPages / limit)
    

    
    return {
      data: await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit
      }),
      meta: {
        total: totalPages,
        page: page,
        lastPage: lastPage
      } 
    }
      

  }
  async findOne(id: number) {
    const product =  await this.product.findFirst({
      where:{ id, available: true }
    });

    if ( !product ) {
      throw new RpcException({ 
        message: `Product with id #${ id } not found`,
        status: HttpStatus.BAD_REQUEST
      });
    }

    return product;

  }


  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: __, ...data } = updateProductDto;

    await this.findOne(id);
    
    return this.product.update({
      where: { id },
      data: data,
    });
  }

  async remove (id: number) {
    await this.findOne(id);  // Asumiendo que esto verifica si el producto existe
  
    const product = await this.product.update({
      where: { id },
      data: { available: false },
    }); 
   
    return product
  }

  async validateProducts(ids: number[]) {
    ids = Array.from(new Set(ids));

    const products = await this.product.findMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    if ( products.length !== ids.length ) {
      throw new RpcException({
        message: 'Some products were not found',
        status: HttpStatus.BAD_REQUEST,
      });
    }


    return products;

  }
}
